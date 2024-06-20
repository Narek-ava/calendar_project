<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Laravel\Nova\Nova;
use Laravel\Nova\NovaApplicationServiceProvider;

class NovaServiceProvider extends NovaApplicationServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot(): void
    {
        parent::boot();

        Nova::style('admin', asset('css/nova/custom.css'));
    }

    /**
     * Register the Nova routes.
     *
     * @return void
     */
    protected function routes(): void
    {
        Nova::routes()
            ->withAuthenticationRoutes()
            ->withPasswordResetRoutes()
            ->register();
    }

    /**
     * Register the Nova gate.
     *
     * This gate determines who can access Nova in non-local environments.
     *
     * @return void
     */
    protected function gate(): void
    {
        Gate::define('viewNova', function ($user) {
            // TODO: need add the super admin role and check it here
            return in_array($user->email, [
                'anton@beetsoft.com',
                'arukosuev@beetsoft.com',
                'rbelyh@beetsoft.com',
                'kyledmclean@gmail.com',
            ]);
        });
    }

    /**
     * Get the dashboards that should be listed in the Nova sidebar.
     *
     * @return array
     */
    protected function dashboards(): array
    {
        return [
            new \App\Nova\Dashboards\Main,
        ];
    }

    /**
     * Get the tools that should be listed in the Nova sidebar.
     *
     * @return array
     */
    public function tools(): array
    {
        return [
//            NovaPermissionTool::make(),
        ];
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register(): void
    {
        Nova::report(function ($exception) {
            if (!app()->isLocal() && app()->bound('sentry')) {
                app('sentry')->captureException($exception);
            }
        });
    }
}
