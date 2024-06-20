<?php

namespace App\Jobs;

use App\Models\Appointment;
use App\Notifications\Customer\AppointmentReminderNotification;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class AppointmentReminderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     *
     * Sends 24h before start of appointment
     *
     * @return void
     */
    public function handle(): void
    {
        $now = Carbon::now()->addDay();

        Appointment::with(['customer', 'company', 'location.address', 'service', 'employee.user'])
            ->active()
            ->whereDate('start_at', $now->format('Y-m-d'))
            ->whereTime('start_at', $now->format('H:i:00'))
            ->where('type', Appointment::APPOINTMENT_TYPE)
            ->chunk(50, function (Collection $appointments) {
                $appointments->each(function (Appointment $appointment) {
                    $appointment->customer->notify(new AppointmentReminderNotification($appointment));
                });
            });
    }
}
