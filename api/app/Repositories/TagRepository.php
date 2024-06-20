<?php

namespace App\Repositories;

use App\Services\FreescoutService;
use GuzzleHttp\Promise\PromiseInterface;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Client\Response;

final class TagRepository
{
    public function __construct(private FreescoutService $freescoutService)
    {
    }

    /**
     * @throws RequestException
     */
    public function list(int $mailboxId): PromiseInterface|Response|array
    {
        $response = $this->freescoutService
            ->setUser(auth()->user()->freescoutAccount->freescout_user_id)
            ->get("/mailboxes/$mailboxId/tags")->throw();

        return $response->json();
    }

    /**
     * @throws RequestException
     */
    public function show(int $mailboxId, int $tag)
    {
        $response = $this->freescoutService
            ->setUser(auth()->user()->freescoutAccount->freescout_user_id)
            ->get("/mailboxes/$mailboxId/tags/$tag")->throw();

        return $response->json();
    }

    /**
     * @throws RequestException
     */
    public function create(int $mailboxId, array $tagData)
    {
        // TODO: Remove feature
//        if (isset($tagData['excluded_employees']) && count($tagData['excluded_employees'])) {
//            $freescoutAccounts = FreescoutAccount::whereIn('user_id', $tagData['excluded_employees'])->pluck('freescout_user_id');
//            unset($tagData['excluded_employees']);
//            $tagData['excluded_users'] = $freescoutAccounts->toArray();
//        }

        $response = $this->freescoutService
            ->setUser(auth()->user()->freescoutAccount->freescout_user_id)
            ->post("/mailboxes/$mailboxId/tags", $tagData)->throw();

        return $response->json();
    }

    /**
     * @throws RequestException
     */
    public function update(int $mailboxId, int $tag, array $tagData)
    {
        // TODO: Remove feature
//        if (isset($tagData['excluded_employees']) && count($tagData['excluded_employees'])) {
//            $freescoutAccounts = FreescoutAccount::whereIn('user_id', $tagData['excluded_employees'])->pluck('freescout_user_id');
//            unset($tagData['excluded_employees']);
//            $tagData['excluded_users'] = $freescoutAccounts->toArray();
//        }

        $response = $this->freescoutService
            ->setUser(auth()->user()->freescoutAccount->freescout_user_id)
            ->patch("/mailboxes/$mailboxId/tags/$tag", $tagData)->throw();

        return $response->json();
    }

    /**
     * @throws RequestException
     */
    public function destroy(int $mailboxId, int $tag)
    {
        $response = $this->freescoutService
            ->setUser(auth()->user()->freescoutAccount->freescout_user_id)
            ->delete("/mailboxes/$mailboxId/tags/$tag")->throw();

        return $response->json();
    }
}
