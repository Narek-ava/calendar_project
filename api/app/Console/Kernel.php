<?php

namespace App\Console;

use App\Console\Commands\SeedDemoAppointments;
use App\Jobs\AppointmentReminderJob;
use App\Jobs\CompleteAppointmentsJob;
use App\Jobs\Google\PeriodicSynchronizationsJob;
use App\Jobs\Google\RefreshWebhookSynchronizationsJob;
use App\Jobs\UncompletedAppointmentReminderJob;
use App\Jobs\UpcomingAppointmentReminderJob;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        //
    ];

    /**
     * Define the application's command schedule.
     *
     * @param Schedule $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule): void
    {
        $schedule->job(new AppointmentReminderJob)->everyMinute();
        $schedule->job(new UpcomingAppointmentReminderJob)->everyMinute();
        $schedule->job(new CompleteAppointmentsJob)->everyMinute();

        $schedule->job(new UncompletedAppointmentReminderJob)->daily();

        $schedule->command(SeedDemoAppointments::class, ['chilled-butter-demo'])
            ->timezone('America/Chicago')
            ->weeklyOn(1, '00:00') // every Monday at 06:00 UTC
            ->environments(['production']);

        // Google Calendar
        $schedule->job(new PeriodicSynchronizationsJob())->everyFifteenMinutes();
        $schedule->job(new RefreshWebhookSynchronizationsJob())->daily();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
