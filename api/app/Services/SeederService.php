<?php

namespace App\Services;

use App\Models\Address;
use App\Models\Appointment;
use App\Models\Company;
use App\Models\CustomerContact;
use App\Models\Employee;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Arr;

final class SeederService
{
    /**
     * @param AppointmentService $appointmentService
     */
    public function __construct(private readonly AppointmentService $appointmentService)
    {
    }

    /**
     * @param array $users
     * @return void
     */
    public function seed(array $users): void
    {
        foreach ($users as $userData) {
            // User - CompanyOwner
            $user = User::updateOrCreate(
                ['email' => Arr::get($userData, 'user.info.email')],
                User::factory()->makeOne(Arr::get($userData, 'user.info'))->toArray()
            );
            $companyOwner = $user->companyOwner()->create(Arr::get($userData, 'company_owner'));

            foreach (Arr::get($userData, 'companies', []) as $companyData) {
                // Company
                $company = Company::factory()->makeOne(Arr::get($companyData, 'info'));
                $company->settings = array_replace_recursive($company->settings, Arr::get($companyData, 'settings', []));

                /* @var Company $company */
                $company = $companyOwner->companies()->create($company->toArray());
                $company->address()->save(Address::factory()->makeOne(Arr::get($companyData, 'address')));
                setPermissionsTeamId($company->id);

                // Employees
                // Owner
                $company->employees()->updateOrCreate(
                    ['company_id' => $company->id, 'user_id' => $user->id],
                    Employee::factory(['self_book' => false])->makeOne()->toArray()
                );
                $user->assignRole(Role::OWNER_ROLE);

                // Other employees
                foreach (Arr::get($companyData, 'employees', []) as $employeeData) {
                    $employeeUser = User::updateOrCreate(
                        ['email' => Arr::get($employeeData, 'user.email')],
                        User::factory()->makeOne(Arr::get($employeeData, 'user'))->toArray()
                    );

                    $company->employees()->updateOrCreate(
                        ['company_id' => $company->id, 'user_id' => $employeeUser->id],
                        Employee::factory(Arr::get($employeeData, 'employee.info', []))->makeOne()->toArray()
                    );

                    $employeeUser->assignRole(Arr::get($employeeData, 'employee.role'));
                }

                // Locations
                foreach (Arr::get($companyData, 'locations', []) as $locationData) {
                    $location = $company->locations()->create(Arr::get($locationData, 'info'));
                    $location->address()->save(Address::factory()->makeOne(Arr::get($locationData, 'address')));
                }

                // Service categories
                $company->serviceCategories()->create(['name' => 'Default']);

                // Services
                foreach (Arr::get($companyData, 'services', []) as $serviceData) {
                    $company->services()->create([
                        'service_category_id' => $company->serviceCategories->first()->id,
                        ...Arr::get($serviceData, 'info')
                    ]);
                }

                // Create relations

                // Service -> Locations
                // Service -> Employees
                foreach ($company->services as $service) {
                    $serviceData = Arr::first(Arr::get($companyData, 'services', []), function ($value) use ($service) {
                        return Arr::get($value, 'info.name') === $service->name;
                    });

                    $service->locations()->attach(
                        $company->locations->filter(fn($location, $locationIndex) => in_array($locationIndex, Arr::get($serviceData, 'locations', [])))
                    );

                    $service->employees()->attach(
                        $company->employees->filter(fn($employee, $employeeIndex) => in_array($employeeIndex, Arr::get($serviceData, 'employees', [])))
                    );
                }

                // Employee -> Locations
                foreach ($company->employees as $employee) {
                    $employeeData = Arr::first(Arr::get($companyData, 'employees', []), function ($value) use ($employee) {
                        return Arr::get($value, 'user.email') === $employee->user->email;
                    });

                    $employee->locations()->attach(
                        $company->locations->filter(fn($location, $locationIndex) => in_array($locationIndex, Arr::get($employeeData, 'employee.locations', [])))
                    );
                }

                // Customers
                foreach (Arr::get($companyData, 'customers', []) as $customerData) {
                    $customer = $company->customers()->create([
                        'company_owner_id' => $company->companyOwner->id,
                        ...Arr::get($customerData, 'info')
                    ]);

                    $customer->address()->save(Address::factory()->makeOne(Arr::get($customerData, 'address')));

                    if (Arr::get($customerData, 'info.email')) {
                        $customer->contacts()->create([
                            'type'  => CustomerContact::EMAIL_TYPE,
                            'value' => Arr::get($customerData, 'info.email'),
                        ]);
                    }

                    if (Arr::get($customerData, 'info.phone')) {
                        $customer->contacts()->create([
                            'type'  => CustomerContact::PHONE_TYPE,
                            'value' => Arr::get($customerData, 'info.phone'),
                        ]);
                    }
                }

                // Appointments
                $this->seedAppointments($company, Arr::get($companyData, 'appointments', []));

                // TODO: Appointments and block times!
                // TODO: Add company with a 10-30 locations|staff|services
                // TODO: Add gateways creds for companies
            }
        }
    }

    /**
     * @param Company $company
     * @param array $appointmentsData
     * @return void
     */
    public function seedAppointments(Company $company, array $appointmentsData): void
    {
        foreach ($appointmentsData as $appointmentData) {
            $service = $company->services->firstWhere('name', Arr::get($appointmentData, 'service'));
            $location = $company->locations->firstWhere('name', Arr::get($appointmentData, 'location'));
            $employee = $company->employees()->whereHas('user', fn($query) => $query->where('email', Arr::get($appointmentData, 'employee')))->first();
            $customer = $company->customers->firstWhere('email', Arr::get($appointmentData, 'customer'));
            $status = Arr::get($appointmentData, 'status', Appointment::ACTIVE_STATUS);

            $this->appointmentService->createAppointment(
                $company,
                $service,
                $location->id,
                $employee->id,
                $customer->id,
                $status,
                Arr::get($appointmentData, 'slot'),
                Arr::get($appointmentData, 'data', []),
            );
        }
    }

    /**
     * @param Company $company
     * @param array $blockTimesData
     * @return void
     */
    public function seedBlockTimes(Company $company, array $blockTimesData): void
    {
        foreach ($blockTimesData as $blockTimeData) {
            $location = $company->locations->firstWhere('name', Arr::get($blockTimeData, 'location'));
            $employee = $company->employees()->whereHas('user', fn($query) => $query->where('email', Arr::get($blockTimeData, 'employee')))->first();

            $this->appointmentService->createBlockedTime(
                $company, [
                'employee_id' => $employee->id,
                'location_id' => $location->id,
                'start_at'    => Arr::get($blockTimeData, 'slot.start_at'),
                'end_at'      => Arr::get($blockTimeData, 'slot.end_at'),
            ]);
        }
    }
}
