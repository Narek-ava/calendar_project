<?php

namespace App\Listeners;

use App\Events\AppointmentCheckedInEvent;
use App\Events\AppointmentCreatedEvent;
use App\Events\AppointmentDateUpdatedEvent;
use App\Events\AppointmentDeletedEvent;
use App\Events\AppointmentListUpdatedEvent;
use App\Events\AppointmentStatusCanceledEvent;
use App\Events\AppointmentStatusCompletedEvent;
use App\Models\Appointment;
use App\Notifications\Customer\AppointmentCreatedNotification as CustomerAppointmentCreatedNotification;
use App\Notifications\Customer\AppointmentDateUpdatedNotification as CustomerAppointmentDateUpdatedNotification;
use App\Notifications\Customer\AppointmentStatusCanceledNotification as CustomerAppointmentStatusCanceled;
use App\Notifications\Customer\AppointmentStatusCompletedNotification as CustomerAppointmentStatusCompleted;
use App\Notifications\Employee\AppointmentCheckedInNotification as EmployeeAppointmentCheckedIn;
use App\Notifications\Employee\AppointmentCreatedNotification as EmployeeAppointmentCreatedNotification;
use App\Notifications\Employee\AppointmentDateUpdatedNotification as EmployeeAppointmentDateUpdatedNotification;
use App\Notifications\Employee\AppointmentStatusCanceledNotification as EmployeeAppointmentStatusCanceled;
use App\Notifications\Employee\AppointmentStatusCompletedNotification as EmployeeAppointmentStatusCompleted;
use App\Notifications\Employee\Google\AppointmentCanceledNotification as EmployeeAppointmentCanceledNotificationToGoogleCalendar;
use App\Notifications\Employee\Google\AppointmentCreatedNotification as EmployeeAppointmentCreatedNotificationToGoogleCalendar;
use App\Notifications\Employee\Google\AppointmentDateUpdatedNotification as EmployeeAppointmentDateUpdatedNotificationToGoogleCalendar;
use App\Services\ReputationManagementService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Events\Dispatcher;
use Throwable;
use function Sentry\captureException;

class SendAppointmentNotificationSubscriber implements ShouldQueue
{
    /**
     * @param ReputationManagementService $reputationManagementService
     */
    public function __construct(private readonly ReputationManagementService $reputationManagementService)
    {
    }

    /**
     * Handle appointment created notification
     *
     * @param AppointmentCreatedEvent $event
     * @return void
     */
    public function handleCreatedNotification(AppointmentCreatedEvent $event): void
    {
        $appointment = $this->loadRelations($event->appointment);

        if ($appointment->type === Appointment::APPOINTMENT_TYPE) {
            $event->appointment->customer->notify(new CustomerAppointmentCreatedNotification($appointment));
        }
        $event->appointment->employee->user->notify(new EmployeeAppointmentCreatedNotification($appointment));
        $event->appointment->employee->user->notify(new EmployeeAppointmentCreatedNotificationToGoogleCalendar($appointment));

        broadcast(new AppointmentListUpdatedEvent($appointment))->toOthers();
    }

    /**
     * Handle appointment date updated notification
     *
     * @param AppointmentDateUpdatedEvent $event
     * @return void
     */
    public function handleDateUpdatedNotification(AppointmentDateUpdatedEvent $event): void
    {
        $appointment = $this->loadRelations($event->appointment);

        if ($appointment->type === Appointment::APPOINTMENT_TYPE) {
            $event->appointment->customer->notify(new CustomerAppointmentDateUpdatedNotification($appointment, $event->previousStartDateCustomer));
        }
        $event->appointment->employee->user->notify(new EmployeeAppointmentDateUpdatedNotification($appointment, $event->previousStartDateLocal));
        $event->appointment->employee->user->notify(new EmployeeAppointmentDateUpdatedNotificationToGoogleCalendar($appointment));

        broadcast(new AppointmentListUpdatedEvent($appointment))->toOthers();
    }

    /**
     * Handle appointment status canceled notification
     *
     * @param AppointmentStatusCanceledEvent $event
     * @return void
     */
    public function handleStatusCanceledNotification(AppointmentStatusCanceledEvent $event): void
    {
        $appointment = $this->loadRelations($event->appointment);

        if ($appointment->type === Appointment::APPOINTMENT_TYPE) {
            $event->appointment->customer->notify(new CustomerAppointmentStatusCanceled($appointment));
        }
        $event->appointment->employee->user->notify(new EmployeeAppointmentStatusCanceled($appointment));
        $event->appointment->employee->user->notify(new EmployeeAppointmentCanceledNotificationToGoogleCalendar($appointment));

        broadcast(new AppointmentListUpdatedEvent($appointment))->toOthers();
    }

    /**
     * Handle appointment status canceled notification
     *
     * @param AppointmentStatusCompletedEvent $event
     * @return void
     */
    public function handleStatusCompletedNotification(AppointmentStatusCompletedEvent $event): void
    {
        $appointment = $this->loadRelations($event->appointment);

        if ($appointment->type === Appointment::APPOINTMENT_TYPE) {
            $event->appointment->customer->notify(new CustomerAppointmentStatusCompleted($appointment));
        }
        $event->appointment->employee->user->notify(new EmployeeAppointmentStatusCompleted($appointment));

        broadcast(new AppointmentListUpdatedEvent($appointment))->toOthers();

        try {
            $this->reputationManagementService->notify($appointment);
        } catch (Throwable $exception) {
            captureException($exception);
        }
    }

    /**
     * Handle appointment checked-in notification
     *
     * @param AppointmentCheckedInEvent $event
     * @return void
     */
    public function handleCheckedInNotification(AppointmentCheckedInEvent $event): void
    {
        $appointment = $this->loadRelations($event->appointment);
        $event->appointment->employee->user->notify(new EmployeeAppointmentCheckedIn($appointment));

        broadcast(new AppointmentListUpdatedEvent($appointment))->toOthers();
    }

    /**
     * Handle appointment deleted notification
     *
     * @param AppointmentDeletedEvent $event
     * @return void
     */
    public function handleDeletedNotification(AppointmentDeletedEvent $event): void
    {
        $appointment = $this->loadRelations($event->appointment);

        $event->appointment->employee->user->notify(new EmployeeAppointmentCanceledNotificationToGoogleCalendar($appointment));

        broadcast(new AppointmentDeletedEvent($appointment))->toOthers();
    }

    /**
     * Register the listeners for the subscriber.
     *
     * @param Dispatcher $events
     * @return array
     */
    public function subscribe(Dispatcher $events): array
    {
        return [
            AppointmentCreatedEvent::class         => 'handleCreatedNotification',
            AppointmentDateUpdatedEvent::class     => 'handleDateUpdatedNotification',
            AppointmentStatusCanceledEvent::class  => 'handleStatusCanceledNotification',
            AppointmentStatusCompletedEvent::class => 'handleStatusCompletedNotification',
            AppointmentCheckedInEvent::class       => 'handleCheckedInNotification',
            AppointmentDeletedEvent::class         => 'handleDeletedNotification',
        ];
    }

    /**
     * @param Appointment $appointment
     * @return Appointment
     */
    private function loadRelations(Appointment $appointment): Appointment
    {
        return $appointment->load([
            'customer' => fn(Relation $q) => $q->withTrashed(),
            'company'  => fn(Relation $q) => $q->withTrashed(),
            'location' => fn(Relation $q) => $q->with(['address'])->withTrashed(),
            'service'  => fn(Relation $q) => $q->withTrashed(),
            'employee' => fn(Relation $q) => $q->with(['user' => fn(Relation $q) => $q->withTrashed()])->withTrashed(),
        ]);
    }
}
