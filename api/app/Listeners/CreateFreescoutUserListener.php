<?php

namespace App\Listeners;

use App\Events\UserCreatedEvent;
use App\Models\FreescoutAccount;
use App\Services\FreescoutService;

class CreateFreescoutUserListener
{
    public function __construct(private FreescoutService $freescoutService)
    {
    }

    /**
     * Handle the event.
     *
     * @param UserCreatedEvent $event
     * @return void
     */
    public function handle(UserCreatedEvent $event)
    {
        $response = $this->freescoutService->post('/users', [
                'first_name' => $event->user->firstname,
                'last_name'  => $event->user->lastname,
                'email'      => $event->user->email,
                'role'       => FreescoutAccount::ROLE_USER,
            ]);

        if ($response->ok()) {
            $data = $response->json();

            if (isset($data['id'])) {
                $event->user->freescoutAccount()->create([
                        'freescout_user_id' => $data['id'],
                        'role'              => $data['role'],
                    ]);
            }
        }
    }
}
