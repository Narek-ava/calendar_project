<?php

namespace App\Policies;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class AppointmentPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     *
     * @param User $user
     * @return Response|bool
     */
    public function viewAny(User $user)
    {
        if ($user->can('appointment.*')) {
            return true;
        }

        if ($user->can('appointment.list')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param User $user
     * @param Appointment $appointment
     * @return Response|bool
     */
    public function view(User $user, Appointment $appointment)
    {
        if ($user->can('appointment.*')) {
            return true;
        }

        if ($user->can('appointment.view')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can create models.
     *
     * @param User $user
     * @return Response|bool
     */
    public function create(User $user)
    {
        if ($user->can('appointment.*')) {
            return true;
        }

        if ($user->can('appointment.create')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param User $user
     * @param Appointment $appointment
     * @return Response|bool
     */
    public function update(User $user, Appointment $appointment)
    {
        if ($user->can('appointment.*')) {
            return true;
        }

        if ($user->can('appointment.update')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param User $user
     * @param Appointment $appointment
     * @return Response|bool
     */
    public function delete(User $user, Appointment $appointment)
    {
        if ($user->can('appointment.*')) {
            return true;
        }

        if ($user->can('appointment.delete')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can restore the model.
     *
     * @param User $user
     * @param Appointment $appointment
     * @return Response|bool
     */
    public function restore(User $user, Appointment $appointment)
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the model.
     *
     * @param User $user
     * @param Appointment $appointment
     * @return Response|bool
     */
    public function forceDelete(User $user, Appointment $appointment)
    {
        //
    }

    /**
     * Determine whether the user can audit the model.
     *
     * @param User $user
     * @param Appointment $appointment
     * @return Response|bool
     */
    public function audit(User $user, Appointment $appointment): Response|bool
    {
        if ($user->can('appointment.*')) {
            return true;
        }

        if ($user->can('appointment.audit')) {
            return true;
        }

        return Response::deny('Access denied');
    }
}
