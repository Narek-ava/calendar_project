<?php

namespace App\Listeners;

use App\Events\CustomerCreatedEvent;
use App\Models\CustomerContact;
use App\Services\FreescoutService;
use Illuminate\Http\Client\RequestException;
use Throwable;

class CreateFreescoutCustomerListener
{
    public function __construct(private FreescoutService $freescoutService)
    {
    }

    /**
     * Handle the event.
     *
     * @param CustomerCreatedEvent $event
     * @return void
     * @throws RequestException
     */
    public function handle(CustomerCreatedEvent $event)
    {
        try {
            $data = [
                'firstName' => $event->customer->firstname,
                'lastName'  => $event->customer->lastname,
                'emails'    => $event->customer->contacts()
                    ->where('type', CustomerContact::EMAIL_TYPE)->get()->map(function (CustomerContact $contact) {
                        return ['type' => CustomerContact::EMAIL_TYPE, 'value' => $contact->value];
                    })->toArray(),
            ];

            $response = $this->freescoutService->post('/customers', $data);

            if ($response->successful()) {
                $data = $response->json();
                $event->customer->freescoutCustomer()->create(['freescout_customer_id' => $data['id']]);
            }
        } catch (Throwable $exception) {
        }
    }
}
