<?php

namespace App\Providers;

use App\Listeners\SendAppointmentNotificationSubscriber;
use App\Listeners\StripeEventListener;
use App\Listeners\UserRegisteredListener;
use App\Models\Appointment;
use App\Models\Company;
use App\Observers\AppointmentObserver;
use App\Observers\CompanyObserver;
use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Laravel\Cashier\Events\WebhookHandled;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        Registered::class     => [
//            SendEmailVerificationNotification::class,
            UserRegisteredListener::class,
        ],
        WebhookHandled::class => [StripeEventListener::class],
    ];

    /**
     * The subscriber classes to register.
     *
     * @var array
     */
    protected $subscribe = [
        SendAppointmentNotificationSubscriber::class,
    ];

    protected $observers = [
        Company::class     => CompanyObserver::class,
        Appointment::class => AppointmentObserver::class,
    ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot(): void
    {
        //
    }
}
