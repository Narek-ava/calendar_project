<?php

namespace App\Observers;

use App\Events\AppointmentCheckedInEvent;
use App\Events\AppointmentCreatedEvent;
use App\Events\AppointmentDateUpdatedEvent;
use App\Events\AppointmentDeletedEvent;
use App\Events\AppointmentStatusCanceledEvent;
use App\Events\AppointmentStatusCompletedEvent;
use App\Models\Appointment;

class AppointmentObserver
{
    /**
     * Handle the Appointment "created" event.
     *
     * @param Appointment $appointment
     * @return void
     */
    public function created(Appointment $appointment): void
    {
        AppointmentCreatedEvent::dispatch($appointment);
    }

    /**
     * Handle the Appointment "updated" event.
     *
     * @param Appointment $appointment
     * @return void
     */
    public function updated(Appointment $appointment): void
    {
        //
        // AppointmentDateUpdatedEvent related
        // Provider or start datetime has been changed
        if ($appointment->wasChanged('employee_id') || $appointment->getOriginal('start_at')->notEqualTo($appointment->start_at)) {
            AppointmentDateUpdatedEvent::dispatch($appointment, $appointment->getOriginal('start_at_local'), $appointment->getOriginal('start_at_customer'));
        }

        //
        // AppointmentStatusCanceledEvent related
        if ($appointment->wasChanged('status') && $appointment->status === Appointment::CANCELED_STATUS) {
            AppointmentStatusCanceledEvent::dispatchIf(
                $appointment->type === Appointment::APPOINTMENT_TYPE,
                $appointment
            );
        }

        //
        // AppointmentStatusCompletedEvent related
        if ($appointment->wasChanged('status') && $appointment->status === Appointment::COMPLETED_STATUS) {
            AppointmentStatusCompletedEvent::dispatchIf(
                $appointment->type === Appointment::APPOINTMENT_TYPE,
                $appointment
            );
        }

        //
        // AppointmentCheckedInEvent related
        if ($appointment->wasChanged('is_checked_in') && $appointment->is_checked_in) {
            AppointmentCheckedInEvent::dispatch($appointment);
        }
    }

    /**
     * Handle the Appointment "deleted" event.
     *
     * @param Appointment $appointment
     * @return void
     */
    public function deleted(Appointment $appointment): void
    {
        AppointmentDeletedEvent::dispatch($appointment);
    }

    /**
     * Handle the Appointment "restored" event.
     *
     * @param Appointment $appointment
     * @return void
     */
    public function restored(Appointment $appointment): void
    {
        //
    }

    /**
     * Handle the Appointment "force deleted" event.
     *
     * @param Appointment $appointment
     * @return void
     */
    public function forceDeleted(Appointment $appointment): void
    {
        //
    }
}
