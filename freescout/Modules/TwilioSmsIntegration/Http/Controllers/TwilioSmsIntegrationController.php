<?php

namespace Modules\TwilioSmsIntegration\Http\Controllers;

use App\Conversation;
use App\Customer;
use App\Mailbox;
use App\Misc\Helper;
use App\Thread;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;
use Illuminate\Http\Testing\MimeType;
use Illuminate\Http\UploadedFile;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use Modules\TwilioSmsIntegration\Http\Requests\IncomingWebhookRequest;
use Modules\TwilioSmsIntegration\Http\Requests\SaveSettingsRequest;
use Modules\TwilioSmsIntegration\Providers\TwilioSmsIntegrationServiceProvider;
use Throwable;
use Twilio\Exceptions\ConfigurationException;
use Twilio\Rest\Client;
use Twilio\Security\RequestValidator;
use TwilioSmsIntegration;

class TwilioSmsIntegrationController extends Controller
{
    public function webhooks(IncomingWebhookRequest $request, Mailbox $mailbox)
    {
        if (class_exists('Debugbar')) \Debugbar::disable();
        if (!$mailbox->getMeta(TwilioSmsIntegration::MODULE_NAME)) return new Response('The module is not configured', 403);
        if (TwilioSmsIntegration::getMailboxSecret($mailbox) != $request->mailbox_secret) return new Response('Mailbox not found', 404);

        // Validate webhook
        $validator = new RequestValidator(array_get($mailbox->getMeta(TwilioSmsIntegration::MODULE_NAME), 'auth_token'));
        $signature = $request->server('HTTP_X_TWILIO_SIGNATURE', '');
        $url = secure_url($request->server('REQUEST_URI'));
        $input = $request->input();

        // for testing purposes
//        $signature = 's8mtkVQmi7P/wgu/897P0whrwEo=';
//        $url = 'https://c729-5-187-2-114.eu.ngrok.io/twiliosms/webhook/1/123';
//        $input = json_decode('{"ToCountry":"US","ToState":"NE","SmsMessageSid":"SM5d7d515caf35e79bc38753c8c79aa0ac","NumMedia":"0","ToCity":"OGALLALA","FromZip":null,"SmsSid":"SM5d7d515caf35e79bc38753c8c79aa0ac","FromState":null,"SmsStatus":"received","FromCity":null,"Body":"\u0445\u0443\u0439 \u0442\u0435\u0431\u0435","FromCountry":"ME","To":"+13082808250","MessagingServiceSid":"MGf52934f3273ccf10ccbf3f6457226ff8","ToZip":"69153","NumSegments":"1","ReferralNumMedia":"0","MessageSid":"SM5d7d515caf35e79bc38753c8c79aa0ac","AccountSid":"ACd85975121dd0583a46bbe240eaab7de4","From":"+38268451670","ApiVersion":"2010-04-01"}', true);

        if (!$validator->validate($signature, $url, $input)) {
            Helper::log(TwilioSmsIntegration::CHANNEL_NAME . ' Incoming', 'Incoming Webhook not valid', [
                'HTTP_X_TWILIO_SIGNATURE' => $signature,
                'url'                     => $url,
                'input'                   => $input
            ]);
            return new Response('You are not Twilio :(', 403);
        }

        Helper::log(TwilioSmsIntegration::CHANNEL_NAME . ' Incoming', 'Incoming Webhook valid', [
            'HTTP_X_TWILIO_SIGNATURE' => $signature,
            'url'                     => $url,
            'input'                   => $input
        ]);

        $channelId = TwilioSmsIntegration::CHANNEL_ID;
        $phone = array_get($input, 'From');
        $message = '<div>' . array_get($input, 'Body');
        $numMedia = (int)array_get($input, 'NumMedia');

        for ($i = 0; $i < $numMedia; $i++) {
            $mediaUrl = array_get($input, "MediaUrl$i");
            $mimeType = new MimeType();
            $fileExtension = $mimeType->search(array_get($input, "MediaContentType$i"));
            $mediaSid = basename($mediaUrl);
            $filename = "$mediaSid.$fileExtension";

            $tmpFile = tempnam(sys_get_temp_dir(), 'download');
            $uploadedFile = new UploadedFile($tmpFile, $filename);

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $mediaUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
            curl_setopt($ch, CURLOPT_USERPWD, array_get($mailbox->getMeta(TwilioSmsIntegrationServiceProvider::MODULE_NAME), 'account_sid') . ':' . array_get($mailbox->getMeta(TwilioSmsIntegrationServiceProvider::MODULE_NAME), 'auth_token'));
            // Option to follow the redirects, otherwise it will return an XML
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            $media = curl_exec($ch);
            curl_close($ch);

            file_put_contents($uploadedFile, $media);

            $path = Storage::disk('s3')->putFile('inbox-mms', $uploadedFile);
            $s3Url = Storage::disk('s3')->url($path);
            unlink($uploadedFile->getPathname());

            $message .= "<br><img src='$s3Url'>";

        }
        $message .= "</div>";

        // Get customer
        $customer = Customer::findByPhone($phone);
        if (!$customer) $customer = Customer::createWithoutEmail(['channel' => $channelId, 'first_name' => $phone, 'phone' => $phone]);

        // Get last customer conversation or create a new one.
        $conversation = $mailbox->conversations()
            ->where('customer_id', $customer->id)
            ->where('channel', $channelId)
            ->orderBy('created_at', 'desc')
            ->first();

        if ($conversation) {
            // Create thread in existing conversation.
            $thread = Thread::createExtended(
                [
                    'type'        => Thread::TYPE_CUSTOMER,
                    'customer_id' => $customer->id,
                    'body'        => $message,
                ],
                $conversation, $customer
            );

            Helper::log(TwilioSmsIntegration::CHANNEL_NAME . ' Debug', 'Thread::createExtended', [
                'conversation_id' => $conversation->id,
                'customer_id'     => $customer->id,
                'type'            => Thread::TYPE_CUSTOMER,
                'body'            => $message,
            ]);

        } else {
            // Create conversation.
            $conversationResult = Conversation::create(
                [
                    'type'        => Conversation::TYPE_CHAT,
                    'subject'     => Conversation::subjectFromText($message),
                    'mailbox_id'  => $mailbox->id,
                    'source_type' => Conversation::SOURCE_TYPE_WEB,
                    'channel'     => $channelId,
                ],
                [[
                    'type'        => Thread::TYPE_CUSTOMER,
                    'customer_id' => $customer->id,
                    'body'        => $message,
                ]],
                $customer
            );

            Helper::log(TwilioSmsIntegration::CHANNEL_NAME . ' Debug', 'Conversation::create', [
                'conversation_type' => Conversation::TYPE_CHAT,
                'subject'           => Conversation::subjectFromText($message),
                'mailbox_id'        => $mailbox->id,
                'source_type'       => Conversation::SOURCE_TYPE_WEB,
                'channel'           => $channelId,
                'type'              => Thread::TYPE_CUSTOMER,
                'customer_id'       => $customer->id,
                'body'              => $message,
            ]);

            $thread = $conversationResult['thread'];
        }

        if ($thread) {
            $thread->setMeta(TwilioSmsIntegration::MODULE_NAME, ['url' => $url, 'input' => $input]);
            $thread->save();
        } else {
            Helper::log(TwilioSmsIntegration::CHANNEL_NAME . ' Debug', 'Thread is no created');
        }
    }

    /**
     * Settings.
     */
    public function settings(Mailbox $mailbox)
    {
        if (!auth()->user()->isAdmin()) Helper::denyAccess();

        return view(TwilioSmsIntegration::MODULE_NAME . '::settings', [
            'mailbox'  => $mailbox,
            'settings' => $mailbox->getMeta(TwilioSmsIntegration::MODULE_NAME),
        ]);
    }

    /**
     * Settings save.
     * @throws ConfigurationException
     */
    public function settingsSave(SaveSettingsRequest $request, Mailbox $mailbox): RedirectResponse
    {
        $settings = $request->validated();

        $client = new Client($settings['account_sid'], $settings['auth_token']);

        // Check Twilio Account
        try {
            $client->getAccount()->fetch();
        } catch (Throwable $exception) {
            Helper::logExceptionToActivityLog($exception, TwilioSmsIntegration::CHANNEL_NAME . ' Settings', 'settingsSave', $settings);

            $request->session()->flash('flash_error', __("Account SID or Auth Token is invalid, see logs for more details"));
            return redirect()->route('mailboxes.' . TwilioSmsIntegration::MODULE_NAME . '.settings', ['mailbox' => $mailbox])->withInput();
        }

        // Check Messaging Service
        try {
            $client->messaging->services($settings['messaging_service_sid'])->fetch();
        } catch (Throwable $exception) {
            Helper::logExceptionToActivityLog($exception, TwilioSmsIntegration::CHANNEL_NAME . ' Settings', 'settingsSave', $settings);

            $request->session()->flash('flash_error', __("Messaging Service SID is invalid, see logs for more details"));
            return redirect()->route('mailboxes.' . TwilioSmsIntegration::MODULE_NAME . '.settings', ['mailbox' => $mailbox])->withInput();
        }

        $mailbox->setMetaParam(TwilioSmsIntegration::MODULE_NAME, $settings);
        $mailbox->save();

        $request->session()->flash('flash_success_floating', __('Settings updated'));
        return redirect()->route('mailboxes.' . TwilioSmsIntegration::MODULE_NAME . '.settings', ['mailbox' => $mailbox]);
    }
}
