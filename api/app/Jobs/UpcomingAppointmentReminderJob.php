<?php

namespace App\Jobs;

use App\Models\Appointment;
use App\Models\Employee;
use App\Models\Location;
use App\Notifications\Employee\UpcomingAppointmentReminderNotification;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class UpcomingAppointmentReminderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Send reminder in # minutes before opening hour
     * @var int $offsetInMinutes
     */
    public static int $offsetInMinutes = 60;

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle(): void
    {
        Location::query()
            ->whereHas('company')
            ->whereHas('appointments', function (Builder $query) {
                $query
                    ->where('start_at', '>=', Carbon::now()->subDay()->startOfDay())
                    ->where('start_at', '<=', Carbon::now()->addDay()->endOfDay())
                    ->where('type', Appointment::APPOINTMENT_TYPE)
                    ->active();
            })
            ->with(['appointments' => function (HasMany $query) {
                $query
                    ->with(['customer'])
                    ->where('start_at', '>=', Carbon::now()->subDay()->startOfDay())
                    ->where('start_at', '<=', Carbon::now()->addDay()->endOfDay())
                    ->where('type', Appointment::APPOINTMENT_TYPE)
                    ->active();
            }])
            ->chunk(10, function (Collection $locations) {
                $locations->each(function (Location $location) {

                    setPermissionsTeamId($location->company->id);

                    // Get diff from local now and startDate of location
                    $nowTz = CarbonImmutable::now($location->time_zone)->setSeconds(0);
                    $whTz = $location->workingHours($nowTz);
                    if (!$whTz) return false;

                    $diffInMinutes = $nowTz->diffInRealMinutes($whTz->getStartDate());

                    // There is one hour before opening of the location
                    // Let's send upcoming reminder for providers of this location
                    if ($diffInMinutes === self::$offsetInMinutes) {
                        $location
                            ->employees
                            ->each(function (Employee $employee) use ($location, $nowTz) {
                                $appointments = $location->appointments
                                    ->where('employee.user.id', $employee->user->id)
                                    ->where('start_at_local', '>=', $nowTz->startOfDay())
                                    ->where('start_at_local', '<=', $nowTz->endOfDay())
                                    ->where('type', Appointment::APPOINTMENT_TYPE);

                                if ($appointments->count()) {
                                    $employee->user->notify(new UpcomingAppointmentReminderNotification($location->company, $appointments));
                                }
                            });
                    }
                });
            });
    }
}
