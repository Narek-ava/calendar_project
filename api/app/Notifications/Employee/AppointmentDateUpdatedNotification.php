<?php

namespace App\Notifications\Employee;

use App\Jobs\UpcomingAppointmentReminderJob;
use App\Models\Appointment;
use App\Models\User;
use App\Notifications\Channels\CompanyLocationTwilioChannel;
use App\Stats\EmailNotificationStats;
use App\Stats\SmsNotificationStats;
use Carbon\CarbonImmutable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\Twilio\TwilioMessage;
use NotificationChannels\Twilio\TwilioSmsMessage;
use Throwable;

class AppointmentDateUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct(public readonly Appointment $appointment, public CarbonImmutable $previousStartDateLocal)
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
     * @param User $notifiable
     * @return array
     */
    public function via(User $notifiable): array
    {
        $channels = ['mail', 'database'];

        if (
            $notifiable->phone &&
            $this->appointment->isStartToday() &&
            $this->appointment->location->isOperatingTimeNow(UpcomingAppointmentReminderJob::$offsetInMinutes)
        ) {
            $channels[] = CompanyLocationTwilioChannel::class;
        }

        return $channels;
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

        $prevDate = $this->formatDate($this->previousStartDateLocal);
        $newDate = $this->formatDate($this->appointment->start_at_local);

        $subject = 'Appointment updated';
        if ($prevDate !== $newDate) $subject .= " from $prevDate to $newDate.";

        $message = (new MailMessage)
            ->from($this->appointment->company->fromEmailAddress(), $this->appointment->company->name)
            ->replyTo($this->appointment->company->replyToAddress(), $this->appointment->company->name)
            ->subject($subject)
            ->markdown('emails.appointment.employee.date-updated', [
                'appointment' => $this->appointment,
                'customer'    => $this->appointment->customer,
                'company'     => $this->appointment->company,
                'location'    => $this->appointment->location,
                'service'     => $this->appointment->service,
                'employee'    => $this->appointment->employee,
                'logo'        => $this->appointment->company->email_logo,
                'logoAlt'     => $this->appointment->company->name,
            ]);


        if (!$notifiable->googleAccounts->count()) {
            $message->attachData(
                $this->appointment->generateICal('employee')->get(),
                'invite.ics',
                ['mime' => 'text/calendar', 'charset' => 'utf-8', 'method' => 'REQUEST']
            );
        }

        return $message;
    }

    public function toTwilio(User $notifiable): TwilioSmsMessage|TwilioMessage
    {
        SmsNotificationStats::increase($this, $this->appointment->company, $notifiable);

        $customer = $this->appointment->customer;
        $prevDate = $this->formatDate($this->previousStartDateLocal);
        $newDate = $this->formatDate($this->appointment->start_at_local);
        $updatedFromTo = $prevDate !== $newDate ? " from $prevDate to $newDate" : '';

        return (new TwilioSmsMessage())->content("Your appointment with $customer->firstname $customer->lastname has been updated$updatedFromTo.");
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

    private function formatDate(CarbonImmutable $date) {
        return $date->isoFormat('MM/DD/YY \a\t h:mma');
    }
}
