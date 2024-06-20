<?php

namespace App\Providers;

use App\Models\Appointment;
use App\Models\Company;
use App\Models\Location;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to the "home" route for your application.
     *
     * This is used by Laravel authentication to redirect users after login.
     *
     * @var string
     */
    public const HOME = '/';

//    protected string $freescoutNamespace = 'App\\Http\\Controllers\\Freescout';

    /**
     * Define your route model bindings, pattern filters, etc.
     *
     * @return void
     */
    public function boot(): void
    {
        //region Backoffice bindings
        Route::bind('location', function ($value) {
            return auth()->user()->contextCompany->locations()->withTrashed()->findOrFail($value);
        });

        Route::bind('service_category', function ($value) {
            return auth()->user()->contextCompany->serviceCategories()->findOrFail($value);
        });

        Route::bind('service', function ($value) {
            return auth()->user()->contextCompany->services()->withTrashed()->findOrFail($value);
        });

        Route::bind('employee', function ($value, \Illuminate\Routing\Route $route) {
            $result = auth()->user()->contextCompany->employees()->withTrashed();
            if($route->getName() === 'employee.invite.resend') $result->withoutGlobalScopes();
            return $result->findOrFail($value);
        });

        Route::bind('customer', function ($value) {
            return auth()->user()->contextCompany->customers()->findOrFail($value);
        });

        Route::bind('appointment', function ($value) {
            // Sometimes employee will see own appointment from another contextCompany
            return auth()->user()->contextCompany
                ->appointments()->findOr($value, fn() => auth()->user()->appointments()->findOrFail($value));
        });
        //endregion

        //region Public(widget) bindings
        Route::bind('publicCompany', function ($value, \Illuminate\Routing\Route $route) {
            return Company::whereSlug($route->publicCompany)->firstOrFail();
        });

        Route::bind('companyAppointment', function ($value, \Illuminate\Routing\Route $route) {
            return $route->publicCompany->appointments()->whereUuid($value)->firstOrFail();
        });

        Route::bind('companyService', function ($value, \Illuminate\Routing\Route $route) {
            return $route->publicCompany->services()->findOrFail($value);
        });

        Route::bind('companyLocation', function ($value, \Illuminate\Routing\Route $route) {
            return $route->publicCompany->locations()->findOrFail($value);
        });

        Route::bind('companyEmployee', function ($value, \Illuminate\Routing\Route $route) {
            return $route->publicCompany->employees()->selfBook()->findOrFail($value);
        });

        // TODO: get rid of this shit
        Route::bind('serviceLocation', function ($value, \Illuminate\Routing\Route $route) {
            return $route->companyService->locations()->findOrFail($value);
        });
        //endregion

        Route::model('kioskLocation', Location::class);
        Route::model('kioskAppointment', Appointment::class);

        $this->configureRateLimiting();

        $this->routes(function () {
            Route::middleware('api')
                ->namespace($this->namespace)
                ->group(base_path('routes/api.php'));

            Route::middleware('inbox')
                ->prefix('inbox')
                ->group(base_path('routes/inbox.php'));

            Route::prefix('kiosk')
                ->namespace($this->namespace)
                ->group(base_path('routes/kiosk.php'));

            if (file_exists(base_path('routes/test.php'))) Route::namespace($this->namespace)->group(base_path('routes/test.php'));
        });
    }

    /**
     * Configure the rate limiters for the application.
     *
     * @return void
     */
    protected function configureRateLimiting()
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(240)->by(optional($request->user())->id ?: $request->ip());
        });
    }
}
