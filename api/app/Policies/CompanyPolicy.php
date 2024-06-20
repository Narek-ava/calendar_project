<?php

namespace App\Policies;

use App\Models\Company;
use App\Models\User;
use App\Services\SubscriptionLimitsService;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Nova;

class CompanyPolicy
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
     * @return bool
     */
    public function viewAny(User $user): bool
    {
        // TODO: Refactor all the policies like this
        // https://nova.laravel.com/docs/4.0/resources/authorization.html#undefined-policy-methods
        // https://nova.laravel.com/docs/4.0/resources/authorization.html#when-nova-application-authorization-logic-differs
        return Nova::whenServing(fn(NovaRequest $request) => true, function () use ($user) {
            if ($user->can('company.*') || $user->canImpersonate()) return true;
            if ($user->can('company.list')) return true;

            return false;
        });
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param User $user
     * @param Company $company
     * @return Response|bool
     */
    public function view(User $user, Company $company): Response|bool
    {
        if ($user->can('company.*')) {
            return true;
        }

        if ($user->can('company.view')) {
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
        if ($user->companyOwner && $this->limits::isCompanyOwnerLimitReached($user->companyOwner)) {
            return Response::deny($this->limits::limitReachedMessage($user->companyOwner->subscription_type));
        }

        if ($user->can('company.*')) {
            return true;
        }

        if ($user->can('company.create')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param User $user
     * @param Company $company
     * @return Response|bool
     */
    public function update(User $user, Company $company): Response|bool
    {
        if ($user->can('company.*')) {
            return true;
        }

        if ($user->can('company.update')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param User $user
     * @param Company $company
     * @return Response|bool
     */
    public function delete(User $user, Company $company): Response|bool
    {
        if ($user->can('company.*')) {
            return true;
        }

        if ($user->can('company.delete')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param User $user
     * @param Company $company
     * @return Response|bool
     */
    public function viewReport(User $user, Company $company): Response|bool
    {
        if ($user->contextCompany->id !== $company->id) return false;

        if ($user->can('company.*')) {
            return true;
        }

        if ($user->can('company.view')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can audit the model.
     *
     * @param User $user
     * @param Company $company
     * @return Response|bool
     */
    public function audit(User $user, Company $company): Response|bool
    {
        if ($user->contextCompany->id !== $company->id) return false;

        if ($user->can('company.*')) {
            return true;
        }

        if ($user->can('company.audit')) {
            return true;
        }

        return Response::deny('Access denied');
    }
}
