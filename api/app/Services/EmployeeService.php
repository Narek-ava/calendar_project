<?php

namespace App\Services;

use App\Mail\EmployeeCreated;
use App\Mail\EmployeeInvited;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Role;
use App\Models\User;
use App\Services\Exceptions\EmployeeException;
use Carbon\Carbon;
use DB;
use DomainException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Hash;
use Mail;
use Str;
use Throwable;

final class EmployeeService
{
    public const INVITE_NEW_USER_ACTION = 'invite_new_user';
    public const INVITE_EXISTING_USER_ACTION = 'invite_existing_user';
    public const RESEND_INVITE_ACTION = 'resend_invite';

    public const INVITE_NOT_ACCEPTED_MESSAGE = 'The user is not accepted invitation yet. Update the email address if you want to send the invite to a different address.';
    public const USER_ALREADY_ADDED_MESSAGE = 'The user is already in this company.';
    public const USER_EXISTS_IN_DB_MESSAGE = 'This user already exists in the system. Please define which role they should take in your company, and we will send them an invitation.';
    public const PROVIDER_EXISTS_IN_DB_MESSAGE = 'Provider already exists in the system. Use Staff page to invite.';

    /**
     * @throws Throwable
     */
    public function inviteEmployee(array $data): Employee
    {
        $company = auth()->user()->contextCompany;

        if ($existUser = User::where(['email' => $data['user']['email']])->first()) {
            return $this->attachExistUser($company, $existUser, $data);
        }

        $user = User::create(['password' => Hash::make(Str::random(8)), ...$data['user']]);

        return $this->createEmployee($company, $user, ['verified_at' => Carbon::now(), ...$data], true);
    }

    /**
     * @throws Throwable
     */
    public function createEmployee(Company $company, User $user, array $data, bool $notification = false): Employee
    {
        $employee = DB::transaction(function () use ($company, $user, $data, $notification) {
            $user->assignRole($data['role']);
            $employee = $company->employees()->create(['user_id' => $user->id, ...$data]);
            $employee->locations()->attach($data['locations'] ?? []);
            $employee->services()->attach($data['services'] ?? []);

            // Settings could be updated from account controller too
            $employee->settings()->set('widget', Arr::get($data, 'settings.widget'));

            if (isset($data['avatar'])) $employee->avatar()->updateOrCreate([], ['link' => $data['avatar']]);

            return $employee;
        });

        if ($notification) $this->sendInvite($employee);

        return $employee;
    }

    /**
     * @throws Throwable
     */
    public function updateEmployee(Employee $employee, array $data): Employee
    {
        $authUser = auth()->user();
        $currentRole = $employee->user->role;
        $newRole = Role::findByName($data['role']);

        if ($authUser->roles()->first()->level >= 3 && $newRole->level < 3) {
            throw new EmployeeException('Permission denied');
        }

        if ($authUser->getAuthIdentifier() === $employee->user->id) {
            if ($newRole->level > $currentRole->level) {
                throw new EmployeeException('You can\'t downgrade the role');
            }
        }

        return DB::transaction(function () use ($employee, $newRole, $data) {
            $employee->user->syncRoles($newRole);
            $employee->update($data);
            $employee->locations()->sync($data['locations'] ?? []);
            $employee->services()->sync($data['services'] ?? []);

            // Settings could be updated from account controller too
            $employee->settings()->set('widget', Arr::get($data, 'settings.widget'));

            if (isset($data['avatar'])) $employee->avatar()->updateOrCreate([], ['link' => $data['avatar']]);

            return $employee;
        });
    }

    public function acceptInvitation(string $token): bool
    {
        if ($employee = Employee::withoutGlobalScopes()->where('verify_token', $token)->first()) {
            return $employee->update([
                'verify_token'       => null,
                'verified_at'        => Carbon::now(),
                'is_invite_accepted' => true,
            ]);
        }

        return false;
    }

    public function delete(Employee $employee): ?bool
    {
        if (auth()->user()->contextCompany->companyOwner->user_id === $employee->user_id) {
            throw new EmployeeException('The owner cannot be removed from the company');
        }

        $appointments = $employee->appointments()->active()->whereDate('start_at', '>=', Carbon::now())->count();

        if ($appointments) {
            throw new EmployeeException('You can’t deactivate staff with upcoming appointments, please re-assign the appointments');
        }

        return $employee->delete();
    }

    /**
     * @throws Throwable
     */
    private function attachExistUser(Company $company, User $user, array $data): Employee
    {
        if ($employee = $company->employees()->withoutGlobalScopes()->withTrashed()->where('user_id', $user->id)->first()) {
            if ($employee->verified_at) {
                throw new DomainException('This employee has already been added to this company');
            }

            $this->sendInvite($employee);

            return $this->updateEmployee($employee, $data);
        }

        return DB::transaction(function () use ($company, $user, $data) {
            return $this->createEmployee($company, $user, $data, true);
        });
    }

    public function sendInvite(Model|Employee $employee): void
    {
        $isExternalEmployee = Employee::query()->withoutGlobalScopes()->withTrashed()->whereNotNull('verified_at')
            ->where('user_id', $employee->user_id)
            ->where('company_id', '!=', $employee->company_id)->count();

        if ($isExternalEmployee) {
            $verifyToken = Str::random(64);

            $employee->update([
                'verify_token' => $verifyToken,
            ]);

            Mail::to($employee->user)->send(new EmployeeInvited($employee->company, $employee->user, $verifyToken));
        } else {
            $password = Str::random(8);

            $employee->user()->update([
                'password' => Hash::make($password),
            ]);

            Mail::to($employee->user)->send(new EmployeeCreated($employee->company, $employee->user, $password));
        }
    }

    /**
     * @param Employee $employee
     * @param string $email
     * @return void
     */
    public function resendInvite(Employee $employee, string $email): void
    {
        // We can update email only if user is invited as new CB user
        if (!$employee->is_invite_accepted && $employee->verified_at) $employee->user->update(['email' => $email]);
        self::sendInvite($employee->fresh());
    }

    /**
     * @param $email
     * @return Response
     */
    public function checkEmail($email): Response
    {
        $user = User::whereEmail($email)->first();

        // Invite not existing in the DB user
        if (!$user) return response(['message' => null, 'action' => self::INVITE_NEW_USER_ACTION]);

        $auth = auth()->user();

        // Employee invited or added to company
        $employee = $auth->contextCompany->employees()->withoutGlobalScopes()->withTrashed()->where('user_id', $user->id)->first();
        if ($employee && !$employee->is_invite_accepted) {
            return response(['message' => self::INVITE_NOT_ACCEPTED_MESSAGE, 'action' => self::RESEND_INVITE_ACTION, 'employee_id' => $employee->id]);
        }
        if ($employee) return response(['message' => self::USER_ALREADY_ADDED_MESSAGE, 'action' => null], 400);

        // Invite existing in the DB user but not in company
        return response(['message' => self::USER_EXISTS_IN_DB_MESSAGE, 'action' => self::INVITE_EXISTING_USER_ACTION]);
    }

    /**
     * @param $data
     * @return Employee
     * @throws Throwable
     */
    public function inviteExistingUser($data): Employee
    {
        $user = User::whereEmail(Arr::get($data, 'email'))->firstOrFail();
        $company = auth()->user()->contextCompany;
        return $this->attachExistUser($company, $user, $data);
    }

    /**
     * @param string $email
     * @return Employee
     * @throws Throwable
     */
    public function createSimplifiedEmployee(string $email): Employee
    {
        $password = Str::random(8);

        $employee = DB::transaction(function () use ($email, $password) {
            $user = User::whereEmail($email)->first();
            if ($user) throw new EmployeeException(self::PROVIDER_EXISTS_IN_DB_MESSAGE);

            $company = auth()->user()->contextCompany;

            list($firstname, $lastname) = explode('@', $email, 2);

            $user = User::create([
                'email'              => $email,
                'firstname'          => $firstname,
                'lastname'           => $lastname,
                'password'           => Hash::make($password),
                'context_company_id' => $company->id,
            ]);

            setPermissionsTeamId($company->id);
            $user->assignRole(Role::PROVIDER_ROLE);

            return $company->employees()->create([
                'user_id'            => $user->id,
                'verified_at'        => Carbon::now(),
            ]);
        });

        Mail::to($employee->user)->send(new EmployeeCreated($employee->company, $employee->user, $password));

        return $employee;
    }
}
