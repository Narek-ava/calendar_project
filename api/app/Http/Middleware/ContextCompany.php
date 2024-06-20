<?php

namespace App\Http\Middleware;

use App\Models\Company;
use App\Services\SubscriptionLimitsService;
use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ContextCompany
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse) $next
     * @return Response|RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->check()) return $next($request);
        $user = auth()->user();
        $contextCompany = Company::find($user->context_company_id);

        if ($user->canImpersonate() && !app('impersonate')->isImpersonating() && (!$user->employee || !$contextCompany)) {
            return $next($request);
        }

        // Check subscription is not deactivated
        if ($user->companyOwner && $user->companyOwner->subscription_type === SubscriptionLimitsService::DEACTIVATED_TYPE) {
            auth()->guard('web')->logout();
            return response(['message' => SubscriptionLimitsService::$deactivatedSubscriptionMessage], 401);
        }

        if (!$user->employee || !$contextCompany) {
            $company = $user->companies()->first();

            if ($company) {
                $user->contextCompany()->associate($company)->save();
                $contextCompany = $company;
            } else {
                auth()->guard('web')->logout();

                return response(['message' => "You don't have a company"], 401);
            }
        }

        setPermissionsTeamId($contextCompany->id);

        return $next($request);
    }
}
