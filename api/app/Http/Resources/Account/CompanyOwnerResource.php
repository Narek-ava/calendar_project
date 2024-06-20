<?php

namespace App\Http\Resources\Account;

use App\Services\SubscriptionLimitsService;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use JsonSerializable;

class CompanyOwnerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array|Arrayable|JsonSerializable
     */
    public function toArray($request): array|JsonSerializable|Arrayable
    {
        return [
            'subscription_type' => $this->subscription_type,
            'limits'            => [
                'max'    => SubscriptionLimitsService::getLimits($this->subscription_type, SubscriptionLimitsService::COMPANY_OWNER_LEVEL),
                'counts' => ['companies' => $this->companies_count],
            ]
        ];
    }
}
