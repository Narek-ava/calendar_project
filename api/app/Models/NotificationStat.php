<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Stats\Traits\HasStats;

class NotificationStat extends Model
{
    use HasStats;

    protected $fillable = [
        'company_id',
        'notification_type',
        'notifiable_type',
        'notifiable_type',
        'notifiable_id',
        'channel',
        'recipient',

        'type',
        'value',
    ];
}
