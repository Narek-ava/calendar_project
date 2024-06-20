<?php

namespace App\Notifications\Employee;

use App\Models\Appointment;
use App\Models\User;
use App\Stats\EmailNotificationStats;
use App\Stats\SmsNotificationStats;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\Twilio\TwilioMessage;
use NotificationChannels\Twilio\TwilioSmsMessage;

class AppointmentReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct(private Appointment $appointment)
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
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param User $notifiable
     * @return MailMessage
     */
    public function toMail(User $notifiable): MailMessage
    {
        EmailNotificationStats::increase($this, $this->appointment->company, $notifiable);

        return (new MailMessage)
            ->from($this->appointment->company->fromEmailAddress(), $this->appointment->company->name)
            ->replyTo($this->appointment->company->replyToAddress(), $this->appointment->company->name)
            ->subject('Upcoming Appointment Reminder')
            ->markdown('emails.appointment.employee.reminder', [
                'appointment' => $this->appointment,
                'customer'    => $this->appointment->customer,
                'company'     => $this->appointment->company,
                'location'    => $this->appointment->location,
                'service'     => $this->appointment->service,
                'employee'    => $this->appointment->employee,
                'logo'        => $this->appointment->company->email_logo,
                'logoAlt'     => $this->appointment->company->name,
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @param User $notifiable
     * @return array
     */
    public function toArray(User $notifiable)
    {
        return [
            'appointment' => $this->appointment,
            'customer'    => $this->appointment->customer,
            'company'     => $this->appointment->company,
            'location'    => $this->appointment->location,
            'service'     => $this->appointment->service,
            'employee'    => $this->appointment->employee,
        ];
    }
}
