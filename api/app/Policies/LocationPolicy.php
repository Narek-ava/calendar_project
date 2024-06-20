<?php

namespace App\Policies;

use App\Models\Location;
use App\Models\Role;
use App\Models\User;
use App\Services\SubscriptionLimitsService;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class LocationPolicy
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
    public function viewAny(User $user)
    {
        if ($user->can('location.*')) {
            return true;
        }

        // Allow FRONTDESK_ROLE to fetch list w/o permission to it
        // Since calendar on the FE requires access to list, but we need to hide menu items on sidebar
        if ($user->hasRole([Role::FRONTDESK_ROLE, Role::READ_ONLY_LIMITED_ROLE]) && !$user->can('location.list')) return true;

        if ($user->can('location.list')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param User $user
     * @param Location $location
     * @return Response|bool
     */
    public function view(User $user, Location $location)
    {
        if ($user->can('location.*')) {
            return true;
        }

        if ($user->can('location.view')) {
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
        if ($user->contextCompany && $this->limits::isCompanyLimitReached($user->contextCompany, 'locations')) {
            return Response::deny($this->limits::limitReachedMessage($user->contextCompany->companyOwner->subscription_type));
        }

        if ($user->can('location.*')) {
            return true;
        }

        if ($user->can('location.create')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param User $user
     * @param Location $location
     * @return Response|bool
     */
    public function update(User $user, Location $location)
    {
        if ($user->can('location.*')) {
            return true;
        }

        if ($user->can('location.update')) {
            return !$location->is_primary ?: Response::deny('Access denied');
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can restore the model.
     *
     * @param User $user
     * @param Location $location
     * @return Response|bool
     */
    public function restore(User $user, Location $location)
    {
        if ($user->can('location.*')) {
            return true;
        }

        if ($user->can('location.restore')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param User $user
     * @param Location $location
     * @return Response|bool
     */
    public function delete(User $user, Location $location)
    {
        if ($user->can('location.*')) {
            return true;
        }

        if ($user->can('location.delete')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can audit the model.
     *
     * @param User $user
     * @param Location $location
     * @return Response|bool
     */
    public function audit(User $user, Location $location)
    {
        if ($user->can('location.*')) {
            return true;
        }

        if ($user->can('location.audit')) {
            return true;
        }

        return Response::deny('Access denied');
    }
}
