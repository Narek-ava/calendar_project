<?php

namespace App\Repositories;

use App\Models\FreescoutMailbox;
use App\Models\User;
use App\Services\FreescoutService;
use Exception;
use GuzzleHttp\Promise\PromiseInterface;
use Illuminate\Http\Client\Response;

final class MailboxRepository
{
    public function __construct(private FreescoutService $freescoutService)
    {
    }

    /**
     * @throws Exception
     */
    public function list(): PromiseInterface|Response|array
    {
        $response = $this->freescoutService
            ->setUser(auth()->user()->freescoutAccount->freescout_user_id)
            ->get('/mailboxes')->throw();

        return $response->json();
    }

    /**
     * @throws Exception
     */
    public function show($mailbox): PromiseInterface|Response|array
    {
        $response = $this->freescoutService
            ->setUser(auth()->user()->freescoutAccount->freescout_user_id)
            ->get("/mailboxes/$mailbox")->throw();

        return $response->json();
    }

    /**
     * @throws Exception
     */
    public function create(array $mailbox): PromiseInterface|Response|array
    {
        $freescoutUserId = auth()->user()->freescoutAccount->freescout_user_id;

        if (isset($mailbox['users'])) {
            $mailbox['users'] = [
                    $freescoutUserId => ['access' => FreescoutMailbox::$access_permissions],
                ] + $this->getFreescoutUserIds($mailbox['users']);
        } else {
            $mailbox['users'] = [
                $freescoutUserId => ['access' => FreescoutMailbox::$access_permissions],
            ];
        }

        $response = $this->freescoutService->setUser($freescoutUserId)->post('/mailboxes', $mailbox)->throw();

        $data = $response->json();

        auth()->user()->contextCompany->freescoutMailboxes()->create([
            'freescout_mailbox_id' => $data['id'],
            'name'                 => $data['name'],
            'email'                => $data['email'],
        ]);

        return $data;
    }

    /**
     * @throws Exception
     */
    public function update(array $mailbox, int $id): PromiseInterface|Response|array
    {
        $freescoutUserId = auth()->user()->freescoutAccount->freescout_user_id;
        $freescoutMailbox = auth()->user()->contextCompany->freescoutMailboxes()->where('id', $id)->first();

        if (isset($mailbox['users'])) {
            $mailbox['users'] = [
                    $freescoutUserId => ['access' => FreescoutMailbox::$access_permissions],
                ] + $this->getFreescoutUserIds($mailbox['users']);
        } else {
            $mailbox['users'] = [
                $freescoutUserId => ['access' => FreescoutMailbox::$access_permissions],
            ];
        }

        $response = $this->freescoutService->setUser($freescoutUserId)
            ->patch("/mailboxes/$freescoutMailbox->freescout_mailbox_id", $mailbox)->throw();

        $data = $response->json();

        $freescoutMailbox->update([
            'name'  => $data['name'],
            'email' => $data['email'],
        ]);

        return $data;
    }

    /**
     * @throws Exception
     */
    public function destroy($mailbox): PromiseInterface|Response|bool
    {
        $freescoutUserId = auth()->user()->freescoutAccount->freescout_user_id;
        $freescoutMailbox = auth()->user()->contextCompany->freescoutMailboxes()->where('id', $mailbox)->first();
        $this->freescoutService->setUser($freescoutUserId)
            ->delete("/mailboxes/$freescoutMailbox->freescout_mailbox_id")->throw();

        return $freescoutMailbox->delete();
    }

    private function getFreescoutUserIds(array $users): array
    {
        $freescoutUsers = [];

        foreach ($users as $id => $user) {
            $freescoutUserId = User::query()->find($id)->freescoutAccount->freescout_user_id;
            $freescoutUsers[$freescoutUserId] = $user;
        }

        return $freescoutUsers;
    }
}
