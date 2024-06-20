<?php

namespace App\Events;

use App\Models\Appointment;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AppointmentListUpdatedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(public Appointment $appointment)
    {
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array
     */
    public function broadcastOn(): array
    {
        // private-App.Models.Company.{company->id}
        $defaultChannels = [
            new PrivateChannel("App.Models.User.{$this->appointment->employee->user->id}")
        ];

        // Get all companies from appointment employee to notify to update appointments list
        // Appointment's company here too
        $this->appointment->employee->user->employees->pluck('company_id')->each(function ($companyId) use (&$defaultChannels) {
            array_push($defaultChannels, new PrivateChannel("App.Models.Company.$companyId"));
        });

        return $defaultChannels;
    }

    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'appointments.list.updated';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        // Since with data is not used at all on FE side, just return id
        // In the future it will be new AppointmentListResource($appointment)->resolve()
        return [
            'id' => $this->appointment->id
        ];
    }
}
