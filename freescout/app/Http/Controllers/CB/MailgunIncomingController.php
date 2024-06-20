<?php

namespace App\Http\Controllers\CB;

use App\Http\Controllers\Controller;
use App\Mailbox;
use App\MailgunIncomingEmail;
use Artisan;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;

class MailgunIncomingController extends Controller
{
    public function handleForwarded(Request $request)
    {
        // Verify webhook
        if (!$this->verify($request)) return response(['message' => 'ok', 'result' => $this->verify($request)], 400);

        // Check mailbox existence
        $mailbox = Mailbox::query()->where('email', $request->input('recipient'))->first();
        $payload = $request->all();
        $uploadedAttachments = [];

        // Upload attachments only if mailbox is exists
        if ($mailbox) {
            foreach ($request->allFiles() as $attachName => $uploadedFile) {
                $uploadedAttachments[$attachName] = [
                    'path' => Storage::disk('s3')->putFile('inbox-attachments', $uploadedFile),
                    'name' => $uploadedFile->getClientOriginalName(),
                ];
            }
        }

        Arr::set($payload, 'uploaded-attachments', $uploadedAttachments);

        MailgunIncomingEmail::query()->create(['payload' => $payload]);

        // Add emails immediately
//        Artisan::call('freescout:fetch-emails');

        return response(['message' => 'ok', 'result' => true]);
    }

    /**
     * Build the signature from POST data
     *
     * @see https://documentation.mailgun.com/en/latest/user_manual.html#webhooks-1 securing webhooks section
     * @param Request $request The request object
     * @return string
     */
    private function buildSignature(Request $request): string
    {
        return hash_hmac(
            'sha256',
            sprintf('%s%s', $request->input('timestamp'), $request->input('token')),
            config('services.mailgun.signing_key')
        );
    }

    /**
     * @param Request $request
     * @return bool
     */
    private function verify(Request $request): bool
    {
        // Check if the timestamp is fresh, max 120 seconds
        if (abs(time() - $request->input('timestamp')) > 120) return false;

        return $this->buildSignature($request) === $request->input('signature');
    }
}
