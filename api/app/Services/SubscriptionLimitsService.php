<?php

namespace App\Services;

use App\Models\Company;
use App\Models\CompanyOwner;
use Illuminate\Support\Str;

final class SubscriptionLimitsService
{
    // -------------------------------------------------------------------
    // Subscription types
    public const SINGLE_USER_TYPE = 'single_user';
    public const ORGANIZATION_TYPE = 'organization';
    public const DEACTIVATED_TYPE = 'deactivated';
    public const SMALL_BUSINESS_TYPE = 'small_business'; // do not use, only for demo/develop purposes!

    public static array $types = [
        self::SINGLE_USER_TYPE,
        self::ORGANIZATION_TYPE,
        self::DEACTIVATED_TYPE,
        self::SMALL_BUSINESS_TYPE, // do not use, only for demo/develop purposes!
    ];

    // -------------------------------------------------------------------
    // Subscription type titles
    public const SINGLE_USER_TYPE_TITLE = 'Single User';
    public const ORGANIZATION_TYPE_TITLE = 'Organization';
    public const DEACTIVATED_TYPE_TITLE = 'Deactivated';
    public const SMALL_BUSINESS_TYPE_TITLE = 'Small Business'; // do not use, only for demo/develop purposes!

    public static array $typeTitles = [
        self::SINGLE_USER_TYPE_TITLE,
        self::ORGANIZATION_TYPE_TITLE,
        self::DEACTIVATED_TYPE_TITLE,
        self::SMALL_BUSINESS_TYPE_TITLE, // do not use, only for demo/develop purposes!
    ];

    // -------------------------------------------------------------------
    // Limits level
    public const COMPANY_LEVEL = 'company';
    public const COMPANY_OWNER_LEVEL = 'company_owner';

    public static array $levels = [
        self::COMPANY_LEVEL,
        self::COMPANY_OWNER_LEVEL,
    ];

    // -------------------------------------------------------------------
    // Default
    public static array $defaultLimits = [
        self::SINGLE_USER_TYPE => [
            self::COMPANY_LEVEL       => ['locations' => 1, 'employees' => 1, 'services' => null], // null - no limit
            self::COMPANY_OWNER_LEVEL => ['companies' => 1]
        ],

        self::ORGANIZATION_TYPE => [
            self::COMPANY_LEVEL       => ['locations' => 2, 'employees' => 10, 'services' => null], // null - no limit
            self::COMPANY_OWNER_LEVEL => ['companies' => 1]
        ],

        self::DEACTIVATED_TYPE    => [
            self::COMPANY_LEVEL       => ['locations' => 0, 'employees' => 0, 'services' => null], // null - no limit
            self::COMPANY_OWNER_LEVEL => ['companies' => 0]
        ],

        // do not use, only for demo/develop purposes!
        self::SMALL_BUSINESS_TYPE => [
            self::COMPANY_LEVEL       => ['locations' => 5, 'employees' => 5, 'services' => 10],
            self::COMPANY_OWNER_LEVEL => ['companies' => 5]
        ],
    ];

    /**
     * @var string
     */
    private static string $limitReachedMessage = "You're on the :subscription-plan-name subscription plan. Please contact support to upgrade your plan to be able to add more staff or locations.";
    public static string $deactivatedSubscriptionMessage = "Your subscription has been deactivated. Please contact support to activate your subscription.";

    /**
     * @param $type
     * @param $level
     * @return array|null
     */
    public static function getLimits($type, $level): ?array
    {
        return self::$defaultLimits[$type][$level] ?? null;
    }

    /**
     * @param Company $company
     * @param string $limitName
     * @return bool
     */
    public static function isCompanyLimitReached(Company $company, string $limitName): bool
    {
        $limits = self::getLimits($company->companyOwner->subscription_type, self::COMPANY_LEVEL);
        if (!$limits || is_null($limits[$limitName])) return false;

        return $company->{$limitName}()->withTrashed()->count() >= $limits[$limitName];
    }

    /**
     * @param CompanyOwner $companyOwner
     * @param string $limitName
     * @return bool
     */
    public static function isCompanyOwnerLimitReached(CompanyOwner $companyOwner, string $limitName = 'companies'): bool
    {
        $limits = self::getLimits($companyOwner->subscription_type, self::COMPANY_OWNER_LEVEL);
        if (!$limits || is_null($limits[$limitName])) return false;

        return $companyOwner->{$limitName}()->withTrashed()->count() >= $limits[$limitName];
    }

    /**
     * @param string $subscriptionType
     * @return string
     */
    public static function limitReachedMessage(string $subscriptionType): string
    {
        $subscriptionTypeTitle = Str::upper($subscriptionType).'_TYPE_TITLE';
        return Str::replace(':subscription-plan-name', constant("self::$subscriptionTypeTitle"), self::$limitReachedMessage);
    }
}
