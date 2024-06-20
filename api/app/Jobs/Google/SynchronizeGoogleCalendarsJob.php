<?php

namespace App\Jobs\Google;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SynchronizeGoogleCalendarsJob extends SynchronizeGoogleResource implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function getGoogleRequest($service, $options)
    {
        return $service->calendarList->listCalendarList($options);
    }

    public function syncItem($googleCalendar)
    {
        if ($googleCalendar->deleted) {
            return $this->synchronizable->calendars()
                ->where('google_id', $googleCalendar->id)
                ->get()->each->delete();
        }

        $this->synchronizable->calendars()->updateOrCreate(
            [
                'google_id' => $googleCalendar->id,
            ],
            [
                'name'              => $googleCalendar->summary,
                'color'             => $googleCalendar->backgroundColor,
                'timezone'          => $googleCalendar->timeZone,
                'accounting_events' => !!$googleCalendar->primary,
            ]
        );
    }

    public function dropAllSyncedItems()
    {
        // Here we use `each->delete()` to make sure model listeners are called.
        $this->synchronizable->calendars->each->delete();
    }
}
