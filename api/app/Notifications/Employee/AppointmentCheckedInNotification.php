<?php

namespace App\Notifications\Employee;

use App\Models\Appointment;
use App\Models\User;
use App\Notifications\Channels\CompanyLocationTwilioChannel;
use App\Stats\SmsNotificationStats;
use Glorand\Model\Settings\Exceptions\ModelSettingsException;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use NotificationChannels\Twilio\TwilioMessage;
use NotificationChannels\Twilio\TwilioSmsMessage;
use Throwable;

class AppointmentCheckedInNotification extends Notification implements ShouldQueue
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
        if ($this->appointment->type === Appointment::BLOCKED_TIME_TYPE) return false;
        if (!$this->appointment->is_notifications_enabled) return false;

        if (!$this->appointment->company->settings()->get('notifications.enabled')) return false;

        if ($channel === CompanyLocationTwilioChannel::class && $this->appointment->company->is_twilio_enabled) {
            if (!$this->appointment->company->settings()->get('integrations.twilio.auth_token')) return false;
            if (!$this->appointment->company->settings()->get('integrations.twilio.account_sid')) return false;
            if (!$this->appointment->location->twilio_phone) return false;
        }

        return true;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param mixed $notifiable
     * @return array
     */
    public function via(User $notifiable): array
    {
        $channels = ['database'];

        if ($notifiable->phone) $channels[] = CompanyLocationTwilioChannel::class;

        return $channels;
    }

    public function toTwilio(User $notifiable): TwilioSmsMessage|TwilioMessage
    {
        SmsNotificationStats::increase($this, $this->appointment->company, $notifiable);

        $customer = $this->appointment->customer;

        return (new TwilioSmsMessage())->content("Customer $customer->firstname $customer->lastname arrived for his appointment at {$this->appointment->location->name}");
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
                'id'         => $this->appointment->service->id,
                'name'       => $this->appointment->service->name,
                'is_virtual' => $this->appointment->service->is_virtual,
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
