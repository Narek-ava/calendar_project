<?php

namespace App\Jobs\Google;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class WatchGoogleEventsJob extends WatchGoogleResource implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function getGoogleRequest($service, $channel)
    {
        return $service->events->watch(
            $this->synchronizable->google_id, $channel
        );
    }
}
