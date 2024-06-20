<?php

namespace App\Concerns;

use App\Models\Google\GoogleSync;
use App\Services\GoogleService;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Throwable;

trait Synchronizable
{
    /**
     * @return void
     */
    public static function bootSynchronizable(): void
    {
        // Start a new synchronization once created.
        static::created(function ($synchronizable) {
            $synchronizable->synchronization()->create();
        });

        // Stop and delete associated synchronization.
        static::deleting(function ($synchronizable) {
            optional($synchronizable->synchronization)->delete();
        });
    }

    /**
     * @return MorphOne
     */
    public function synchronization(): MorphOne
    {
        return $this->morphOne(GoogleSync::class, 'syncble');
    }

    /**
     * @param $service
     * @return mixed
     * @throws Throwable
     */
    public function getGoogleService($service): mixed
    {
        return app(GoogleService::class)
            ->connectWithSynchronizable($this)
            ->service($service);
    }

    abstract public function synchronize();

    abstract public function watch();
}
