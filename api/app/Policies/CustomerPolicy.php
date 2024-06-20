<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class CustomerPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     *
     * @param User $user
     * @return Response|bool
     */
    public function viewAny(User $user): Response|bool
    {
        if ($user->can('customer.*')) {
            return true;
        }

        if ($user->can('customer.list')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param User $user
     * @param Customer $customer
     * @return Response|bool
     */
    public function view(User $user, Customer $customer): Response|bool
    {
        if ($user->can('customer.*')) {
            return true;
        }

        if ($user->can('customer.view')) {
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
        if ($user->can('customer.*')) {
            return true;
        }

        if ($user->can('customer.create')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param User $user
     * @param Customer $customer
     * @return Response|bool
     */
    public function update(User $user, Customer $customer): Response|bool
    {
        if ($user->can('customer.*')) {
            return true;
        }

        if ($user->can('customer.update')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param User $user
     * @param Customer $customer
     * @return Response|bool
     */
    public function delete(User $user, Customer $customer): Response|bool
    {
        if ($user->can('customer.*')) {
            return true;
        }

        if ($user->can('customer.delete')) {
            return true;
        }

        return Response::deny('Access denied');
    }

    /**
     * Determine whether the user can audit the model.
     *
     * @param User $user
     * @param Customer $customer
     * @return Response|bool
     */
    public function audit(User $user, Customer $customer): Response|bool
    {
        if ($user->can('customer.*')) {
            return true;
        }

        if ($user->can('customer.audit')) {
            return true;
        }

        return Response::deny('Access denied');
    }
}
