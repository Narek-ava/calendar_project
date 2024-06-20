<?php

namespace App\Models\Google;

use App\Models\Appointment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class GoogleEvent extends Model
{
    protected $with = ['googleCalendar'];

    protected $fillable = [
        'appointment_id',
        'google_id', 'name', 'description', 'allday', 'started_at', 'ended_at',
    ];

    /**
     * @return BelongsTo
     */
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    /**
     * @return BelongsTo
     */
    public function googleCalendar(): BelongsTo
    {
        return $this->belongsTo(GoogleCalendar::class);
    }

    /**
     * @param $start
     * @return Carbon
     */
    public function getStartedAtAttribute($start): Carbon
    {
        return $this->asDateTime($start)->setTimezone($this->calendar->timezone);
    }

    /**
     * @param $end
     * @return Carbon
     */
    public function getEndedAtAttribute($end): Carbon
    {
        return $this->asDateTime($end)->setTimezone($this->calendar->timezone);
    }

    /**
     * @return string
     */
    public function getDurationAttribute(): string
    {
        return $this->started_at->diffForHumans($this->ended_at, true);
    }
}
