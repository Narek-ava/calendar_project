<?php

namespace App\Notifications\Customer;

use App\Models\Appointment;
use App\Models\Customer;
use App\Stats\EmailNotificationStats;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
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
        return
            $this->appointment->company->settings()->get('notifications.enabled') &&
            $this->appointment->company->settings()->get('appointments.completed_notify_customers');
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param Customer $notifiable
     * @return array
     */
    public function via(Customer $notifiable): array
    {
        $channels = ['database'];

        if ($notifiable->email) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param Customer $notifiable
     * @return MailMessage
     */
    public function toMail(Customer $notifiable): MailMessage
    {
        EmailNotificationStats::increase($this, $this->appointment->company, $notifiable);

        return (new MailMessage)
            ->from($this->appointment->company->fromEmailAddress(), $this->appointment->company->name)
            ->replyTo($this->appointment->company->replyToAddress(), $this->appointment->company->name)
            ->subject('Appointment Completed')
            ->markdown('emails.appointment.customer.status-completed', [
                'appointment' => $this->appointment,
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
     * @param Customer $notifiable
     * @return array
     */
    public function toArray(Customer $notifiable): array
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
