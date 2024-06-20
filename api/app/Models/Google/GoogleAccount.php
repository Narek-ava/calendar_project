<?php

namespace App\Models\Google;

use App\Concerns\Synchronizable;
use App\Jobs\Google\SynchronizeGoogleCalendarsJob;
use App\Jobs\Google\WatchGoogleCalendarsJob;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GoogleAccount extends Model
{
    use Synchronizable;

    protected $fillable = [
        'google_id', 'name', 'token',
    ];

    protected $casts = [
        'token' => 'json',
    ];

    /**
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany
     */
    public function calendars(): HasMany
    {
        return $this->hasMany(GoogleCalendar::class);
    }

    /**
     * @return void
     */
    public function synchronize(): void
    {
        SynchronizeGoogleCalendarsJob::dispatch($this);
    }

    /**
     * @return void
     */
    public function watch(): void
    {
        WatchGoogleCalendarsJob::dispatch($this);
    }
}
