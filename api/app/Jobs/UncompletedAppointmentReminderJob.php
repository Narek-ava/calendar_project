<?php

namespace App\Jobs;

use App\Models\Appointment;
use App\Models\Company;
use App\Models\Role;
use App\Models\User;
use App\Notifications\Employee\UncompletedAppointmentReminderNotification;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class UncompletedAppointmentReminderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle(): void
    {
        Company::query()
            ->whereHas('appointments', function (Builder $query) {
                $query
                    ->where('start_at', '>=', Carbon::now()->subDay()->startOfDay())
                    ->where('start_at', '<=', Carbon::now()->subDay()->endOfDay())
                    ->where('type', Appointment::APPOINTMENT_TYPE)
                    ->active();
            })
            ->with(['appointments' => function (HasMany $query) {
                $query
                    ->with(['employee.user'])
                    ->where('start_at', '>=', Carbon::now()->subDay()->startOfDay())
                    ->where('start_at', '<=', Carbon::now()->subDay()->endOfDay())
                    ->where('type', Appointment::APPOINTMENT_TYPE)
                    ->active();
            }])
            ->chunk(10, function (Collection $companies) {
                $companies->each(function (Company $company) {

                    setPermissionsTeamId($company->id);

                    $company
                        ->users()->role([Role::ADMIN_ROLE])
                        ->each(function (User $user) use ($company) {
                            $user->notify(new UncompletedAppointmentReminderNotification($company, $company->appointments));
                        });
                });
            });
    }
}
