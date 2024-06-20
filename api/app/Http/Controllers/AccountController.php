<?php

namespace App\Http\Controllers;

use App\Events\ContextCompanyChangedEvent;
use App\Http\Requests\Account\EmployeeSettingsRequest;
use App\Http\Requests\Account\UpdatePasswordRequest;
use App\Http\Requests\AccountRequest;
use App\Http\Resources\AccountResource;
use App\Http\Resources\LocationResource;
use App\Models\Image;
use App\Models\User;
use Exception;
use Hash;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class AccountController extends Controller
{
    /**
     * @return AccountResource
     */
    public function __invoke(): AccountResource
    {
        $user = User::find(auth()->user()->getAuthIdentifier())->load([
            'employee'       => fn(HasOne $q) => $q->with(['company', 'locations', 'services']),
            'role.permissions',
            'companies',
            'companyOwner'   => fn(HasOne $q) => $q->withCount(['companies' => fn($q) => $q->withTrashed()]),
            'contextCompany' => fn(BelongsTo $q) => $q->withCount([
                'locations' => fn($q) => $q->withTrashed(),
                'services'  => fn($q) => $q->withTrashed(),
                'employees' => fn($q) => $q->withTrashed()
            ]),
        ]);

        return new AccountResource($user);
    }

    /**
     * @param AccountRequest $request
     * @return AccountResource
     */
    public function update(AccountRequest $request): AccountResource
    {
        $user = User::find(auth()->user()->getAuthIdentifier());

        $user->update($request->validated());

        if ($avatar = $request->get('avatar')) {
            if ($user->avatar) {
                $user->avatar()->update(['link' => $avatar]);
            } else {
                $user->avatar()->save(new Image(['link' => $avatar]));
            }
        }

        return new AccountResource($user->fresh([
            'employee' => fn(HasOne $q) => $q->with(['company', 'locations', 'services']),
            'role.permissions',
            'companies',
        ]));
    }

    public function changePassword(UpdatePasswordRequest $request): Response
    {
        $user = User::find(auth()->user()->getAuthIdentifier());

        $user->update(['password' => Hash::make($request->get('new_password'))]);

        return response(['message' => 'Password changed'], 200);
    }

    public function changeContextCompany(Request $request): AccountResource
    {
        auth()->user()->contextCompany()->associate($request->get('company_id'))->save();
        broadcast(new ContextCompanyChangedEvent(auth()->user()->id, $request->get('company_id')))->toOthers();

        // Mark employee as invite accepted in case of fully new user creation process from stuff page
        $employee = auth()->user()->employee;
        if ($employee) $employee->update(['is_invite_accepted' => true]);

        return new AccountResource(auth()->user());
    }

    /**
     * @return AnonymousResourceCollection
     */
    public function locations(): AnonymousResourceCollection
    {
        return LocationResource::collection(auth()->user()->employee->locations);
    }

    /**
     * @param Request $request
     * @param User $user
     * @return RedirectResponse
     */
    public function stripeBillingPortal(Request $request, User $user): RedirectResponse
    {
        if (!$request->hasValidSignature()) abort(401);
        return $user->redirectToBillingPortal(config('app.frontend_url'));
    }

    /**
     * @return Exception|array
     */
    public function showEmployeeSettings(): Exception|array
    {
        try {
            return auth()->user()->employee->settings()->getMultiple([
                'calendar',
            ]);
        } catch (Exception $exception) {
            return $exception;
        }
    }

    /**
     * @param EmployeeSettingsRequest $request
     * @return Exception|array
     */
    public function updateEmployeeSettings(EmployeeSettingsRequest $request): Exception|array
    {
        try {
            // Settings could be updated from EmployeeService too
            return auth()->user()->employee->settings()->set('calendar', $request->validated('settings.calendar'))->all();
        } catch (Exception $exception) {
            return $exception;
        }
    }
}
