<?php

namespace App\Observers;

use App\Models\Company;
use App\Models\Employee;
use App\Models\Role;
use App\Services\EmployeeService;
use Carbon\Carbon;
use Throwable;

class CompanyObserver
{
    /**
     * @param EmployeeService $employeeService
     */
    public function __construct(private readonly EmployeeService $employeeService)
    {
    }

    /**
     * Handle events after all transactions are committed.
     *
     * @var bool
     */
    public bool $afterCommit = true;

    /**
     * Handle the Company "created" event.
     *
     * @param Company $company
     * @return void
     * @throws Throwable
     */
    public function created(Company $company): void
    {
        setPermissionsTeamId($company->id);

        foreach (Role::$defaultRoles as $role) {
            Role::create([
                'company_id' => $company->id,
                'name'       => $role['name'],
                'level'      => $role['level'],
                'label'      => $role['label'],
                'guard_name' => 'web',
            ])->givePermissionTo($role['permissions']);
        }

        // We do not need to run this code from seeders
        if (!Employee::isUnguarded()) {
            $this->employeeService->createEmployee($company, $company->owner, [
                'verified_at' => Carbon::now(),
                'self_book'   => false,
                'role'        => Role::OWNER_ROLE,
            ]);
        }
    }

    /**
     * Handle the Company "updated" event.
     *
     * @param Company $company
     * @return void
     */
    public function updated(Company $company)
    {
        //
    }

    /**
     * Handle the Company "deleted" event.
     *
     * @param Company $company
     * @return void
     */
    public function deleted(Company $company)
    {
        //
    }

    /**
     * Handle the Company "restored" event.
     *
     * @param Company $company
     * @return void
     */
    public function restored(Company $company)
    {
        //
    }

    /**
     * Handle the Company "force deleted" event.
     *
     * @param Company $company
     * @return void
     */
    public function forceDeleted(Company $company)
    {
        //
    }
}
