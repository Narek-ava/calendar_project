<?php

namespace App\Providers;

use App\Models\Company;
use App\Models\Location;
use App\Models\User;
use App\Policies\CompanyPolicy;
use App\Policies\LocationPolicy;
use Carbon\Carbon;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        Company::class  => CompanyPolicy::class,
        Location::class => LocationPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        ResetPassword::createUrlUsing(function (User $user, string $token) {
            return config('app.frontend_url') . "/reset-password?token=$token&email=$user->email";
        });

        VerifyEmail::createUrlUsing(function ($notifiable) {
            $frontendUrl = config('app.frontend_url');

            $verifyUrl = URL::temporarySignedRoute(
                'verification.verify',
                Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
                [
                    'id'   => $notifiable->getKey(),
                    'hash' => sha1($notifiable->getEmailForVerification()),
                ],
                false
            );

            return "$frontendUrl$verifyUrl";
        });
    }
}
