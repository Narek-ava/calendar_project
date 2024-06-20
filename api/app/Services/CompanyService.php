<?php

namespace App\Services;

use App\Models\Address;
use App\Models\Company;
use App\Models\Image;
use App\Models\User;
use DateTimeZone;
use Illuminate\Support\Arr;

final class CompanyService
{
    public function createCompany(User $user, array $company, array $address = [], string $logo = null, string $logoRect = null)
    {
        $availableTimezones = array_merge(
            DateTimeZone::listIdentifiers(DateTimeZone::UTC),
            DateTimeZone::listIdentifiers(DateTimeZone::PER_COUNTRY, 'US')
        );
        $fallbackTimezone = 'America/Chicago';

        $timezone = Arr::get($company, 'time_zone', $fallbackTimezone);
        if (!in_array($timezone, $availableTimezones)) $timezone = $fallbackTimezone;

        $companyOwner = $user->companyOwner()->firstOrCreate([], ['subscription_type' => Arr::get($company, 'subscription_type')]);
        $company = $companyOwner->companies()->create($company);

        if ($logo) {
            $company->logo()->save(new Image(['link' => $logo, 'type' => Company::LOGO_MAIN_TYPE]));
        }

        if ($logoRect) {
            $company->logo()->save(new Image(['link' => $logoRect, 'type' => Company::LOGO_RECTANGULAR_TYPE]));
        }

        $company->address()->save(new Address($address));
        $company->serviceCategories()->create([
            'name' => 'Default',
        ]);

        $location = $company->locations()->create([
            'name'       => "$company->name location",
            'phone'      => $company->phone,
            'is_primary' => true,
            'time_zone'  => $timezone,
        ]);
        $location->address()->save(new Address($address));

        return $company;
    }
}
