<?php

namespace App\Notifications\Customer;

use App\Models\Appointment;
use App\Models\Customer;
use App\Notifications\Channels\CompanyLocationTwilioChannel;
use App\Stats\EmailNotificationStats;
use App\Stats\SmsNotificationStats;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
use NotificationChannels\Twilio\TwilioMessage;
use NotificationChannels\Twilio\TwilioSmsMessage;
use Throwable;

class AppointmentCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct(public Appointment $appointment)
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
     * @param Customer $notifiable
     * @return array
     */
    public function via(Customer $notifiable): array
    {
        $channels = ['database'];

        if ($notifiable->phone) {
            $channels[] = CompanyLocationTwilioChannel::class;
        }

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
            ->subject('Appointment Confirmation')
            ->markdown('emails.appointment.customer.created', [
                'appointment' => $this->appointment,
                'customer'    => $this->appointment->customer,
                'company'     => $this->appointment->company,
                'location'    => $this->appointment->location,
                'service'     => $this->appointment->service,
                'employee'    => $this->appointment->employee,
                'logo'        => $this->appointment->company->email_logo,
                'logoAlt'     => $this->appointment->company->name,
            ])
            ->attachData(
                $this->appointment->generateICal()->get(),
                'invite.ics',
                ['mime' => 'text/calendar', 'charset' => 'utf-8', 'method' => 'REQUEST']
            );
    }

    public function toTwilio(Customer $notifiable): TwilioSmsMessage|TwilioMessage
    {
        SmsNotificationStats::increase($this, $this->appointment->company, $notifiable);

        $company = $this->appointment->company;
        $customer = $this->appointment->customer;
        $service = $this->appointment->service;
        $employee = $this->appointment->employee;
        $employeeUser = $employee->user;
        $date = $this->appointment->start_at_customer->isoFormat('MM/DD/YY \a\t h:mma');
        $shortUrl = $this->appointment->getShortUrl('widgetUrl');

        $message = "Hey, $customer->firstname! Your $service->name appointment with $employeeUser->firstname at $company->name is confirmed for $date. For details check $shortUrl";
        if (app()->isLocal()) Log::info('toTwilio', ['to' => $customer->routeNotificationForTwilio(), 'message' => $message, 'notification' => __CLASS__]);

        return (new TwilioSmsMessage())->content($message);
    }

    /**
     * Get the array representation of the notification.
     *
     * @param mixed $notifiable
     * @return array
     */
    public function toArray(Customer $notifiable)
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
