<?php

namespace Database\Seeders;

use App\Events\CustomerCreatedEvent;
use App\Models\Address;
use App\Models\Company;
use App\Models\Customer;
use App\Models\CustomerContact;
use App\Models\Location;
use App\Models\Role;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use Arr;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $admin = User::create([
            'firstname' => 'Admin',
            'lastname'  => 'Admin',
            'email'     => 'admin@admin.com',
            'phone'     => '920-908-0657',
            'password'  => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        ]);

        $admin->companyOwner()->create();
        $companies = collect();

        $employeeSelfBook = true;
        $employeeSchedule = '[
                    {"id":"1","label":"Monday","enable":true,"start":"2022-01-26 09:00:00","end":"2022-01-26 18:00:00"},
                    {"id":"2","label":"Tuesday","enable":true,"start":"2022-01-26 09:00:00","end":"2022-01-26 18:00:00"},
                    {"id":"3","label":"Wednesday","enable":true,"start":"2022-01-26 09:00:00","end":"2022-01-26 18:00:00"},
                    {"id":"4","label":"Thursday","enable":true,"start":"2022-01-26 09:00:00","end":"2022-01-26 18:00:00"},
                    {"id":"5","label":"Friday","enable":true,"start":"2022-01-26 09:00:00","end":"2022-01-26 18:00:00"},
                    {"id":"6","label":"Saturday","enable":true,"start":"2022-01-26 09:00:00","end":"2022-01-26 18:00:00"},
                    {"id":"0","label":"Sunday","enable":true,"start":"2022-01-26 09:00:00","end":"2022-01-26 18:00:00"}
                ]';

        Company::factory()->count(3)->make()->each(function ($company) use ($admin, $companies, $employeeSchedule, $employeeSelfBook) {
            $company = $admin->companyOwner->companies()->create($company->toArray());
            setPermissionsTeamId($company->id);
            $companies->push($company);
            $company->users()->attach($admin, [
                'verified_at'      => Carbon::now(),
                'background_color' => '2196f3',
                'text_color'       => 'ffffff',
                'schedule'         => $employeeSchedule,
                'self_book'        => $employeeSelfBook,
                'slug'             => Str::slug($admin->full_name),
            ]);
            $company->address()->save(new Address(Address::factory()->count(1)->make()->first()->toArray()));
            $locations = collect();
            $admin->assignRole('owner');

            Location::factory()->count(3)->make()->each(function ($location) use ($company, $locations) {
                $location = $company->locations()->create($location->toArray());
                $locations->push($location);
                $location->address()->save(new Address(Address::factory()->count(1)->make()->first()->toArray()));
            });

            User::factory()->count(3)->make()->each(function ($user) use ($company, $locations, $employeeSchedule, $employeeSelfBook) {
                $user = $company->users()->create(
                    $user->toArray(),
                    [
                        'verified_at'      => Carbon::now(),
                        'background_color' => '2196f3',
                        'text_color'       => 'ffffff',
                        'schedule'         => $employeeSchedule,
                        'self_book'        => $employeeSelfBook,
                        'slug'             => Str::slug($user->full_name),
                    ]
                );
                $user->assignRole(Arr::random(Role::$availableRoles));
            });

            $employees = $company->employees;
            $employees->each(fn($employee) => $employee->locations()->attach($locations->map(fn($location) => $location->id)));

            ServiceCategory::factory()->count(3)->make()->each(function ($serviceCategory) use ($company, $locations, $employees) {
                $serviceCategory = $company->serviceCategories()->create($serviceCategory->toArray());
                Service::factory()->count(3)->make()->each(function ($service) use ($company, $serviceCategory, $locations, $employees) {
                    $service = $company->services()
                        ->create(array_merge($service->toArray(), ['service_category_id' => $serviceCategory->id]));
                    $service->locations()->attach($locations->map(fn($location) => $location->id));
                    $service->employees()->attach($employees->map(fn($employee) => $employee->id));
                });
            });

            Customer::factory()->count(3)->make()->each(function ($customer) use ($admin) {
                $data = $customer->toArray();
                $customer = $admin->companyOwner->customers()->create($data);
                $customer->address()->save(new Address(Address::factory()->count(1)->make()->first()->toArray()));
                $customer->contacts()->create([
                    'type'  => CustomerContact::EMAIL_TYPE,
                    'value' => $data['email'],
                ]);

                event(new CustomerCreatedEvent($customer));
            });
        });

        $admin->update(['context_company_id' => $companies->first()->id]);
    }
}
