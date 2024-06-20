<?php

namespace App\Notifications\Employee;

use App\Models\Company;
use App\Models\User;
use App\Stats\EmailNotificationStats;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UpcomingAppointmentReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;


    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct(private readonly Company $company, private readonly Collection $appointments)
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
        return $this->company->settings()->get('notifications.enabled');
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param User $notifiable
     * @return array
     */
    public function via(User $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param User $notifiable
     * @return MailMessage
     */
    public function toMail(User $notifiable): MailMessage
    {
        EmailNotificationStats::increase($this, $this->company, $notifiable);

        return (new MailMessage)
            ->from($this->company->fromEmailAddress(), $this->company->name)
            ->replyTo($this->company->replyToAddress(), $this->company->name)
            ->subject('Upcoming Appointments Reminder')
            ->markdown('emails.appointment.employee.upcoming-appointments', [
                'appointments' => $this->appointments,
                'user'         => $notifiable,
                'logo'         => $this->company->email_logo,
                'logoAlt'      => $this->company->name,
            ]);
    }
}
