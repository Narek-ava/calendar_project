<?php

namespace App\Notifications\Channels;

use App\Models\Appointment;
use App\Models\Google\GoogleAccount;
use App\Notifications\Employee\Google\AppointmentCanceledNotification;
use App\Notifications\Employee\Google\AppointmentCreatedNotification;
use App\Notifications\Employee\Google\AppointmentDateUpdatedNotification;
use Illuminate\Notifications\Notification;
use Throwable;
use function Sentry\captureException;

class GoogleCalendarChannel
{
    /**
     * @param $notifiable
     * @param Notification $notification
     * @return void
     */
    public function send($notifiable, Notification $notification): void
    {
        /* @var Appointment $appointment */
        $appointment = $notification->appointment;
        try {
            $notifiable->googleAccounts->each(function (GoogleAccount $googleAccount) use ($notification, $appointment) {
                $googleEventsQuery = $googleAccount->getGoogleService('Calendar')->events;

                match (true) {
                    $notification instanceof AppointmentCreatedNotification     => $googleEventsQuery->insert('primary', $appointment->generateGoogleEvent()),
                    $notification instanceof AppointmentDateUpdatedNotification => $googleEventsQuery->update('primary', $appointment->googleEvent->google_id, $appointment->generateGoogleEvent()),
                    $notification instanceof AppointmentCanceledNotification    => $googleEventsQuery->delete('primary', $appointment->googleEvent->google_id),
                };
            });
        } catch (Throwable $exception) {
            captureException($exception);
        }
    }
}


