<?php

namespace App\Nova\Actions;

use App\Models\Company;
use App\Models\CompanyOwner;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Actions\DestructiveAction;
use Laravel\Nova\Fields\ActionFields;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Http\Requests\NovaRequest;
use Throwable;

class CompanyChangeOwner extends DestructiveAction
{

    /**
     * The displayable name of the action.
     *
     * @var string
     */
    public $name = 'Change Owner';

    /**
     * @var Company
     */
    private Company $company;

    /**
     * @param Company $model
     */
    public function __construct(Company $model)
    {
        $this->company = $model;
    }

    /**
     * Perform the action on the given models.
     *
     * @param ActionFields $fields
     * @param Collection $models
     * @return string[]
     * @throws Throwable
     */
    public function handle(ActionFields $fields, Collection $models): array
    {
        //
        // To avoid problems in the future with teams permissions
        // Get session team_id for restore it later
        $contextCompanyId = getPermissionsTeamId();

        // Start changing owner

        /* @var Company $company */
        $company = $models->first();
        setPermissionsTeamId($company->id);

        $newUser = User::find($fields->user);
        $newCompanyOwner = CompanyOwner::firstOrCreate(['user_id' => $newUser->id]);

        // Pick customers from old owner and give to new owner
        try {
            Customer::where('company_owner_id', $company->companyOwner->id)
                ->where('company_id', $company->id)
                ->update(['company_owner_id' => $newCompanyOwner->id]);
        } catch (Throwable $exception) {
            DB::rollBack();
            return Action::danger('Owner has not been changed, there is conflict with customers between companies');
        }

        try {
            // Try to find a new user already in company, even if the user did not accept the invitation
            $newUserEmployee = Employee::withoutGlobalScopes()->where('user_id', $newUser->id)->where('company_id', $company->id)->first();

            if (!$newUserEmployee) {
                // Transfer employee from old to new owner
                Employee::where('user_id', $company->owner->id)->where('company_id', $company->id)
                    ->update(['user_id' => $newUser->id]);
            }

            // Remove owner role from current owner and add admin role
            $company->owner->syncRoles([Role::ADMIN_ROLE]);

            // Remove any roles from new owner and add owner role
            $newUser->syncRoles([Role::OWNER_ROLE]);

            //
            $company->update(['company_owner_id' => $newCompanyOwner->id]);
            // Owner has been changed

        } catch (Throwable $exception) {
            DB::rollBack();
            return Action::danger("Operation was aborted with code: {$exception->getCode()} and message: {$exception->getMessage()}");
        }

        //
        // To avoid problems in the future with teams permissions
        // restore session team_id to package instance
        setPermissionsTeamId($contextCompanyId);

        return Action::message('Owner has been changed');
    }

    /**
     * Get the fields available on the action.
     *
     * @param NovaRequest $request
     * @return array
     */
    public function fields(NovaRequest $request): array
    {
        return [
            Select::make('User')->searchable()
                ->rules(['required', 'exists:users,id'])
                ->default($this->company->owner?->id) // on saving request there is no incoming model
                ->options(User::all()->sortBy('id')->map(function ($user) {
                    return ['value' => $user->id, "label" => "$user->fullname ($user->email)"];
                }))
        ];
    }
}
