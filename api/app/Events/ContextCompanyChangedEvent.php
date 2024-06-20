<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ContextCompanyChangedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(public int $userId, public int $contextCompanyId)
    {
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("App.Models.User.{$this->userId}")
        ];
    }

    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'contextCompany.changed';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'userId'           => $this->userId,
            'contextCompanyId' => $this->contextCompanyId,
        ];
    }
}
