<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\ImpersonateRequest;
use App\Models\Company;
use App\Services\SubscriptionLimitsService;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Response;

class ImpersonateController extends Controller
{
    /**
     * @param ImpersonateRequest $request
     * @return Application|ResponseFactory|Response|void
     */
    public function impersonate(ImpersonateRequest $request)
    {
        $impersonator = auth()->user();

        $manager = app('impersonate');
        if ($manager->isImpersonating()) {
            $impersonator = $manager->getImpersonator();
            auth()->user()->leaveImpersonation();
        }

        $company = Company::findOrFail($request->validated('company_id'));

        if ($company->companyOwner->subscription_type === SubscriptionLimitsService::DEACTIVATED_TYPE) {
            return response(['message' => 'This owner can not be impersonated due to deactivated subscription.'], 400);
        }

        $impersonator->impersonate($company->owner, 'web');
        setPermissionsTeamId($company->id);
    }

    /**
     * @return void
     */
    public function leave(): void
    {
        auth()->user()->leaveImpersonation();
    }
}
