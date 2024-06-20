<?php

namespace App\Policies;

use App\Models\Employee;
use App\Models\Role;
use App\Models\User;
use App\Services\SubscriptionLimitsService;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class EmployeePolicy
{
    use HandlesAuthorization;

    /**
     * @param SubscriptionLimitsService $limits
     */
    public function __construct(private readonly SubscriptionLimitsService $limits)
    {
    }

    /**
     * Determine whether the user can view any models.
     *
     * @param User $user
     * @return Response|bool
     */
    public function viewAny(User $user): Response|bool
    {
        if ($user->can('employee.*')) {
            return true;
        }

        // Allow FRONTDESK_ROLE to fetch list w/o permission to it
        // Since calendar on the FE requires access to list, but we need to hide menu items on sidebar
        if ($user->hasRole([Role::FRONTDESK_ROLE, Role::READ_ONLY_LIMITED_ROLE]) && !$user->can('employee.list')) return true;

        if ($user->can('employee.list')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param User $user
     * @param Employee $employee
     * @return Response|bool
     */
    public function view(User $user, Employee $employee): Response|bool
    {
        if ($user->can('employee.*')) {
            return true;
        }

        if ($user->can('employee.view')) {
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
    public function create(User $user): Response|bool
    {
        if ($user->contextCompany && $this->limits::isCompanyLimitReached($user->contextCompany, 'employees')) {
            return Response::deny($this->limits::limitReachedMessage($user->contextCompany->companyOwner->subscription_type));
        }

        if ($user->can('employee.*')) {
            return true;
        }

        if ($user->can('employee.create')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param User $user
     * @param Employee $employee
     * @return Response|bool
     */
    public function update(User $user, Employee $employee): Response|bool
    {
        if ($user->can('employee.*')) {
            return true;
        }

        if ($user->can('employee.update')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can restore the model.
     *
     * @param User $user
     * @param Employee $employee
     * @return Response|bool
     */
    public function restore(User $user, Employee $employee)
    {
        if ($user->can('employee.*')) {
            return true;
        }

        if ($user->can('employee.restore')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param User $user
     * @param Employee $employee
     * @return Response|bool
     */
    public function delete(User $user, Employee $employee): Response|bool
    {
        if ($user->can('employee.*')) {
            return true;
        }

        if ($user->can('employee.delete')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can audit the model.
     *
     * @param User $user
     * @param Employee $employee
     * @return Response|bool
     */
    public function audit(User $user, Employee $employee): Response|bool
    {
        if ($user->can('employee.*')) {
            return true;
        }

        if ($user->can('employee.audit')) {
            return true;
        }

        return Response::deny('Access denied');
    }

}
