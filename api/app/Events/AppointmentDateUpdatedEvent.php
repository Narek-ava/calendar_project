<?php

namespace App\Events;

use App\Models\Appointment;
use Carbon\CarbonImmutable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AppointmentDateUpdatedEvent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(public Appointment $appointment, public CarbonImmutable $previousStartDateLocal, public CarbonImmutable $previousStartDateCustomer)
    {
    }
}
