<?php

namespace App\Repositories;

use App\Services\FreescoutService;
use Exception;
use GuzzleHttp\Promise\PromiseInterface;
use Illuminate\Http\Client\Response;

final class ConversationRepository
{
    public function __construct(private FreescoutService $freescoutService)
    {
    }

    /**
     * @throws Exception
     */
    public function list($mailboxId, $query): PromiseInterface|Response|array
    {
        $response = $this->freescoutService
            ->setUser(auth()->user()->freescoutAccount->freescout_user_id)
            ->get("/mailboxes/$mailboxId/conversations", $query)->throw();

        return $response->json();
    }

    /**
     * @throws Exception
     */
    public function show($mailboxId, $conversationId): PromiseInterface|Response|array
    {
        $response = $this->freescoutService
            ->setUser(auth()->user()->freescoutAccount->freescout_user_id)
            ->get("/mailboxes/$mailboxId/conversations/$conversationId")->throw();

        return $response->json();
    }

    /**
     * @throws Exception
     */
    public function create(int $mailboxId, array $conversationData): PromiseInterface|Response|array
    {
        $freescoutUserId = auth()->user()->freescoutAccount->freescout_user_id;

        $response = $this->freescoutService->setUser($freescoutUserId)
            ->post("/mailboxes/$mailboxId/conversations", $conversationData)->throw();

        return $response->json();
    }

    /**
     * @throws Exception
     */
    public function update(int $mailboxId, int $conversationId, array $conversationData): PromiseInterface|Response|array
    {
        $freescoutUserId = auth()->user()->freescoutAccount->freescout_user_id;

        $response = $this->freescoutService->setUser($freescoutUserId)
            ->patch("/mailboxes/$mailboxId/conversations/$conversationId", $conversationData)->throw();

        return $response->json();
    }

    /**
     * @throws Exception
     */
    public function destroy($mailboxId, $conversationId): PromiseInterface|Response|bool
    {
        $freescoutUserId = auth()->user()->freescoutAccount->freescout_user_id;

        $response = $this->freescoutService->setUser($freescoutUserId)
            ->delete("/mailboxes/$mailboxId/conversations/$conversationId")->throw();

        return $response->json();
    }

    /**
     * @throws Exception
     */
    public function bulkDestroy($mailboxId, array $conversationData): PromiseInterface|Response|bool
    {
        $freescoutUserId = auth()->user()->freescoutAccount->freescout_user_id;

        $response = $this->freescoutService->setUser($freescoutUserId)
            ->delete("/mailboxes/$mailboxId/conversations/bulk", $conversationData)->throw();

        return $response->json();
    }

    public function assign($mailboxId, $conversationId, $conversationData)
    {
        $freescoutUserId = auth()->user()->freescoutAccount->freescout_user_id;

        $response = $this->freescoutService->setUser($freescoutUserId)
            ->post("/mailboxes/$mailboxId/conversations/$conversationId/assign", $conversationData)->throw();

        return $response->json();
    }

    public function bulkAssign($mailboxId, $conversationData)
    {
        $freescoutUserId = auth()->user()->freescoutAccount->freescout_user_id;

        $response = $this->freescoutService->setUser($freescoutUserId)
            ->post("/mailboxes/$mailboxId/conversations/assign/bulk", $conversationData)->throw();

        return $response->json();
    }

    public function status($mailboxId, $conversationId, $conversationData)
    {
        $freescoutUserId = auth()->user()->freescoutAccount->freescout_user_id;

        $response = $this->freescoutService->setUser($freescoutUserId)
            ->post("/mailboxes/$mailboxId/conversations/$conversationId/status", $conversationData)->throw();

        return $response->json();
    }

    public function bulkStatus($mailboxId, $conversationData)
    {
        $freescoutUserId = auth()->user()->freescoutAccount->freescout_user_id;

        $response = $this->freescoutService->setUser($freescoutUserId)
            ->post("/mailboxes/$mailboxId/conversations/status/bulk", $conversationData)->throw();

        return $response->json();
    }

    public function unread($mailboxId, $conversationId)
    {
        $freescoutUserId = auth()->user()->freescoutAccount->freescout_user_id;

        $response = $this->freescoutService->setUser($freescoutUserId)
            ->post("/mailboxes/$mailboxId/conversations/$conversationId/unread", [])->throw();

        return $response->json();
    }

    public function bulkUnread($mailboxId, $conversationData)
    {
        $freescoutUserId = auth()->user()->freescoutAccount->freescout_user_id;

        $response = $this->freescoutService->setUser($freescoutUserId)
            ->post("/mailboxes/$mailboxId/conversations/unread/bulk", $conversationData)->throw();

        return $response->json();
    }
}
