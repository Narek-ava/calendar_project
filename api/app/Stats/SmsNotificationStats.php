<?php

namespace App\Stats;

use App\Models\Company;
use App\Models\NotificationStat;
use Illuminate\Notifications\Notification;
use Spatie\Stats\StatsWriter;
use Throwable;

class SmsNotificationStats
{
    /**
     * @param Notification $notification
     * @param Company $company
     * @param $notifiable
     * @return void
     */
    public static function increase(Notification $notification, Company $company, $notifiable): void
    {
        try {
            StatsWriter::for(NotificationStat::class, [
                'company_id'        => $company->id,
                'notification_type' => $notification::class,
                'notifiable_type'   => $notifiable::class,
                'notifiable_id'     => $notifiable->id,
                'channel'           => 'sms',
                'recipient'         => $notifiable->phone
            ])->increase();
        } catch (Throwable $exception) {
        }
    }
}
