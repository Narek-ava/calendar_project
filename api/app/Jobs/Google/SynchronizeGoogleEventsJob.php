<?php

namespace App\Jobs\Google;

use Arr;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;

class SynchronizeGoogleEventsJob extends SynchronizeGoogleResource implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function getGoogleRequest($service, $options)
    {
        return $service->events->listEvents(
            $this->synchronizable->google_id, [...$options, 'singleEvents' => true]
        );
    }

    public function syncItem($googleEvent)
    {
        if ($googleEvent->status === 'cancelled') {
            return $this->synchronizable->events()
                ->where('google_id', $googleEvent->id)
                ->delete();
        }

        $eventData = [
            'appointment_id' => Arr::get($googleEvent->getExtendedProperties()?->getPrivate(), 'appointment_id'),
            'name'           => $googleEvent->summary ?? '(No title)',
            'description'    => $googleEvent->description,
            'allday'         => $this->isAllDayEvent($googleEvent),
            'started_at'     => $this->parseDatetime($googleEvent->start),
            'ended_at'       => $this->parseDatetime($googleEvent->end)->subSecond(),
        ];

        $this->synchronizable->events()->updateOrCreate(['google_id' => $googleEvent->id], $eventData);
    }

    protected function isAllDayEvent($googleEvent)
    {
        return !$googleEvent->start->dateTime && !$googleEvent->end->dateTime;
    }

    protected function parseDatetime($googleDatetime)
    {
        $rawDatetime = $googleDatetime->dateTime ?: $googleDatetime->date;

        return Carbon::parse($rawDatetime)->setTimezone('UTC');
    }

    public function dropAllSyncedItems()
    {
        $this->synchronizable->events()->delete();
    }
}
