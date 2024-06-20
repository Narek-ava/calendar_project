<?php

namespace App\Jobs\Google;

use Throwable;

abstract class SynchronizeGoogleResource
{
    protected $synchronizable;
    protected $synchronization;

    public function __construct($synchronizable)
    {
        $this->synchronizable = $synchronizable;
        $this->synchronization = $synchronizable->synchronization;
    }

    /**
     * @throws Throwable
     */
    public function handle()
    {
        $pageToken = null;
        $syncToken = $this->synchronization->token;
        $service = $this->synchronizable->getGoogleService('Calendar');

        do {
            $tokens = compact('pageToken', 'syncToken');

            try {
                $list = $this->getGoogleRequest($service, $tokens);
            } catch (Throwable $e) {
                if ($e->getCode() === 410) {
                    $this->synchronization->update(['token' => null]);
                    $this->dropAllSyncedItems();
                    return $this->handle();
                }
                throw $e;
            }

            foreach ($list->getItems() as $item) {
                $this->syncItem($item);
            }

            $pageToken = $list->getNextPageToken();
        } while ($pageToken);

        $this->synchronization->update([
            'token'          => $list->getNextSyncToken(),
            'last_synced_at' => now(),
        ]);
    }

    abstract public function getGoogleRequest($service, $options);

    abstract public function dropAllSyncedItems();

    abstract public function syncItem($item);
}
