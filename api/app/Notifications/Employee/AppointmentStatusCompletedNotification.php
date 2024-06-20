<?php

namespace App\Notifications\Employee;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class AppointmentStatusCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct(private readonly Appointment $appointment)
    {
    }

    /**
     * Determine if the notification should be sent.
     *
     * @param mixed $notifiable
     * @param string $channel
     * @return bool
     */
    public function shouldSend(mixed $notifiable, string $channel): bool
    {
        if (!$this->appointment->is_notifications_enabled) return false;
        return $this->appointment->company->settings()->get('notifications.enabled');
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param User $notifiable
     * @return array
     */
    public function via(User $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @param User $notifiable
     * @return array
     */
    public function toArray(User $notifiable): array
    {
        return [
            'id'       => $this->appointment->id,
            'company'  => [
                'id' => $this->appointment->company->id,
            ],
            'start_at' => $this->appointment->start_at,
            'end_at'   => $this->appointment->end_at,
            'service'  => [
                'id'            => $this->appointment->service->id,
                'name'          => $this->appointment->service->name,
                'is_virtual'    => $this->appointment->service->is_virtual,
            ],
            'customer' => [
                'id'        => $this->appointment->customer->id,
                'firstname' => $this->appointment->customer->firstname,
                'lastname'  => $this->appointment->customer->lastname,
            ],
            'location' => [
                'id'        => $this->appointment->location->id,
                'name'      => $this->appointment->location->name,
                'time_zone' => $this->appointment->location->time_zone,
                'address'   => [
                    'address'     => $this->appointment->location->address->address,
                    'city'        => $this->appointment->location->address->city,
                    'state'       => $this->appointment->location->address->state,
                    'country'     => $this->appointment->location->address->country,
                    'postal_code' => $this->appointment->location->address->postal_code,
                ],
            ],
        ];
    }
}
