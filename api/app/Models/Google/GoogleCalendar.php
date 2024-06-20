<?php

namespace App\Models\Google;

use App\Concerns\Synchronizable;
use App\Jobs\Google\SynchronizeGoogleEventsJob;
use App\Jobs\Google\WatchGoogleEventsJob;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GoogleCalendar extends Model
{
    use Synchronizable;

    protected $fillable = [
        'google_id', 'accounting_events', 'name', 'color', 'timezone',
    ];

    /**
     * @return BelongsTo
     */
    public function googleAccount(): BelongsTo
    {
        return $this->belongsTo(GoogleAccount::class);
    }

    /**
     * @return HasMany
     */
    public function events(): HasMany
    {
        return $this->hasMany(GoogleEvent::class);
    }

    /**
     * @return void
     */
    public function synchronize(): void
    {
        SynchronizeGoogleEventsJob::dispatch($this);
    }

    /**
     * @return void
     */
    public function watch(): void
    {
        WatchGoogleEventsJob::dispatch($this);
    }
}
