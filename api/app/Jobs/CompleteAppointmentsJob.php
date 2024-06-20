<?php

namespace App\Jobs;

use App\Models\Appointment;
use App\Services\AppointmentService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CompleteAppointmentsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     *
     * Mark appointments completed. Based on settings of company
     *
     * @param AppointmentService $appointmentService
     * @return void
     */
    public function handle(AppointmentService $appointmentService): void
    {
        Appointment::query()
            ->select('appointments.*')
            ->where('appointments.status', Appointment::ACTIVE_STATUS)
            ->where('appointments.type', Appointment::APPOINTMENT_TYPE)
            ->rightJoin('companies as c', function (Builder $join) {
                $join
                    ->on('c.id', '=', 'appointments.company_id')
                    ->where(DB::raw("(c.settings->'appointments'->'autocomplete'->>'enabled')::boolean"), true);
            })
            ->where(DB::raw("appointments.end_at + (c.settings->'appointments'->'autocomplete'->>'interval' || ' hours')::interval"), '<=', Carbon::now())
            ->chunk(50, function (Collection $appointments) use ($appointmentService) {
                $appointments->each(fn(Appointment $appointment) => $appointmentService->completeAppointment($appointment, true));
            });
    }
}
