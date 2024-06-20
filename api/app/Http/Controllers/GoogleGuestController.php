<?php

namespace App\Http\Controllers;

use App\Models\Google\GoogleSync;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class GoogleGuestController extends Controller
{
    /**
     * Just pass code from Google redirect from Backend to Frontend
     * At this moment we have no authorized user to attach Google Account
     *
     * @param Request $request
     * @return Response
     */
    public function oauth(Request $request): Response
    {
        $postMessage = json_encode([
            'is_google_auth_response' => true,
            'result' => true,
            'code'   => $request->input('code')
        ]);
//        return response("<pre style='user-select: all;'>{$request->input('code')}</pre>");
        return response("<script>window.opener.postMessage('$postMessage', '*');</script>");
    }

    public function webhook(Request $request)
    {
        if ($request->header('x-goog-resource-state') !== 'exists') {
            return;
        }

        GoogleSync::query()
            ->where('id', $request->header('x-goog-channel-id'))
            ->where('resource_id', $request->header('x-goog-resource-id'))
            ->firstOrFail()
            ->ping();
    }
}
