<?php

namespace App\Notifications\Employee\Google;

use App\Models\Appointment;
use App\Models\User;
use App\Notifications\Channels\GoogleCalendarChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Throwable;

class AppointmentCanceledNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct(public readonly Appointment $appointment)
    {
    }

    /**
     * Determine if the notification should be sent.
     *
     * @param mixed $notifiable
     * @param string $channel
     * @return bool
     * @throws Throwable
     */
    public function shouldSend(mixed $notifiable, string $channel): bool
    {
        return !!$this->appointment->googleEvent;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param mixed $notifiable
     * @return array
     */
    public function via(User $notifiable): array
    {
        return [GoogleCalendarChannel::class];
    }
}
