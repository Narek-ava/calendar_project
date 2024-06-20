<?php

namespace App\Repositories;

use App\Models\User;
use App\Services\FreescoutService;
use Illuminate\Http\Client\RequestException;

final class ThreadRepository
{
    public function __construct(private FreescoutService $freescoutService)
    {
    }

    /**
     * @throws RequestException
     */
    public function create($thread, $mailboxId, $conversationId)
    {
        $freescoutUserId = auth()->user()->freescoutAccount->freescout_user_id;

        if (isset($thread['user'])) {
            $thread['user'] = User::find($thread['user'])->freescoutAccount->freescout_user_id;
        }

        $response = $this->freescoutService
            ->setUser($freescoutUserId)
            ->post("/mailboxes/$mailboxId/conversations/$conversationId/threads", $thread)
            ->throw();

        return $response->json();
    }
}
