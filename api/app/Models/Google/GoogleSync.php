<?php

namespace App\Models\Google;

use Google\Service\Calendar\Channel as GoogleChannel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Ramsey\Uuid\Uuid;
use Throwable;

class GoogleSync extends Model
{
    public $incrementing = false;

    protected $fillable = [
        'token', 'last_synced_at', 'resource_id', 'expired_at'
    ];

    protected $casts = [
        'last_synced_at' => 'datetime',
        'expired_at'     => 'datetime',
    ];

    /**
     * @return void
     */
    public static function boot(): void
    {
        parent::boot();

        static::creating(function (self $synchronization) {
            $synchronization->id = Uuid::uuid4();
            $synchronization->last_synced_at = now();
        });

        static::created(function (self $synchronization) {
            $synchronization->startListeningForChanges();
            $synchronization->ping();
        });

        static::deleting(function (self $synchronization) {
            $synchronization->stopListeningForChanges();
        });
    }

    /**
     * @return MorphTo
     */
    public function syncble(): MorphTo
    {
        return $this->morphTo();
    }

    public function ping()
    {
        return $this->syncble->synchronize();
    }

    /**
     * @return $this
     * @throws Throwable
     */
    public function refreshWebhook(): static
    {
        $this->stopListeningForChanges();

        // Update the UUID since the previous one has
        // already been associated to a Google Channel.
        $this->id = Uuid::uuid4();
        $this->save();

        $this->startListeningForChanges();

        return $this;
    }

    /**
     * @return mixed
     */
    public function startListeningForChanges(): mixed
    {
        return $this->syncble->watch();
    }

    /**
     * @return void
     */
    public function stopListeningForChanges(): void
    {
        if (!$this->resource_id) {
            return;
        }

        $this->syncble
            ->getGoogleService('Calendar')
            ->channels->stop($this->asGoogleChannel());
    }

    /**
     * @return GoogleChannel
     */
    public function asGoogleChannel(): GoogleChannel
    {
        return tap(new GoogleChannel(), function (GoogleChannel $channel) {
            $channel->setId($this->id);
            $channel->setResourceId($this->resource_id);
            $channel->setType('web_hook');
            $channel->setAddress(config('services.google.webhook_uri'));
        });
    }
}
