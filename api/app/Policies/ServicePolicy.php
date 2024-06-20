<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\Service;
use App\Models\User;
use App\Services\SubscriptionLimitsService;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class ServicePolicy
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
        if ($user->can('service.*')) {
            return true;
        }

        // Allow FRONTDESK_ROLE to fetch list w/o permission to it
        // Since calendar on the FE requires access to list, but we need to hide menu items on sidebar
        if ($user->hasRole([Role::FRONTDESK_ROLE, Role::READ_ONLY_LIMITED_ROLE]) && !$user->can('service.list')) return true;

        if ($user->can('service.list')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param User $user
     * @param Service $service
     * @return Response|bool
     */
    public function view(User $user, Service $service): Response|bool
    {
        if ($user->can('service.*')) {
            return true;
        }

        if ($user->can('service.view')) {
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
        if ($user->contextCompany && $this->limits::isCompanyLimitReached($user->contextCompany, 'services')) {
            return Response::deny($this->limits::limitReachedMessage($user->contextCompany->companyOwner->subscription_type));
        }

        if ($user->can('service.*')) {
            return true;
        }

        if ($user->can('service.create')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param User $user
     * @param Service $service
     * @return Response|bool
     */
    public function update(User $user, Service $service): Response|bool
    {
        if ($user->can('service.*')) {
            return true;
        }

        if ($user->can('service.update')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param User $user
     * @param Service $service
     * @return Response|bool
     */
    public function delete(User $user, Service $service): Response|bool
    {
        if ($user->can('service.*')) {
            return true;
        }

        if ($user->can('service.delete')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can restore the model.
     *
     * @param User $user
     * @param Service $service
     * @return Response|bool
     */
    public function restore(User $user, Service $service)
    {
        if ($user->can('service.*')) {
            return true;
        }

        if ($user->can('service.restore')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can permanently delete the model.
     *
     * @param User $user
     * @param Service $service
     * @return Response|bool
     */
    public function forceDelete(User $user, Service $service)
    {
        //
    }

    /**
     * Determine whether the user can audit the model.
     *
     * @param User $user
     * @param Service $service
     * @return Response|bool
     */
    public function audit(User $user, Service $service): Response|bool
    {
        if ($user->can('service.*')) {
            return true;
        }

        if ($user->can('service.audit')) {
            return true;
        }

        return Response::deny('Access denied');
    }
}
