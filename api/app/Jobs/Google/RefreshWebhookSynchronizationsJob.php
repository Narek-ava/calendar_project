<?php

namespace App\Jobs\Google;

use App\Models\Google\GoogleSync;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RefreshWebhookSynchronizationsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        GoogleSync::query()
            ->whereNotNull('resource_id')
            ->whereNull('expired_at')
            ->orWhere('expired_at', '<', now()->addDays(2))
            ->get()
            ->each->refreshWebhook();
    }
}
