<?php

namespace App\Listeners;

use App\Notifications\User\WelcomeEmailNotification;
use Illuminate\Auth\Events\Registered;

class UserRegisteredListener
{
    /**
     * Handle the event.
     *
     * @param Registered $event
     * @return void
     */
    public function handle(Registered $event): void
    {
        $event->user->notify(new WelcomeEmailNotification());
    }
}
