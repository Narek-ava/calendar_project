<?php

namespace App\Http\Resources\Account;

use App\Http\Resources\ImageResource;
use App\Services\SubscriptionLimitsService;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use JsonSerializable;

class ContextCompanyResource extends JsonResource
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
            'id'                => $this->id,
            'uuid'              => $this->uuid,
            'slug'              => $this->slug,
            'name'              => $this->name,
            'logo'              => new ImageResource($this->logo),
            'subscription_type' => $this->companyOwner->subscription_type,
            'limits'            => [
                'max'    => SubscriptionLimitsService::getLimits($this->companyOwner->subscription_type, SubscriptionLimitsService::COMPANY_LEVEL),
                'counts' => [
                    'locations' => $this->locations_count,
                    'services'  => $this->services_count,
                    'employees' => $this->employees_count
                ],
            ],
            'is_twilio_enabled' => $this->is_twilio_enabled,
            'waiver_data'       => $this->waiver_data
        ];
    }
}
