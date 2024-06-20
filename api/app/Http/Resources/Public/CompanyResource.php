<?php

namespace App\Http\Resources\Public;

use App\Models\Appointment;
use App\Models\Company;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Arr;
use JsonSerializable;

class CompanyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array|Arrayable|JsonSerializable
     */
    public function toArray($request): array|JsonSerializable|Arrayable
    {
        $paymentGateways = [Appointment::PAYPAL_PAYMENT_METHOD => [
            'is_enabled' => $this->isPaypalEnabled(),
            'client_id'  => $this->settings()->get('integrations.paypal.client_id')
        ]];

        match ($this->settings()->get('integrations.cc_processor')) {
            Appointment::AUTHORIZE_NET_PAYMENT_METHOD => Arr::set($paymentGateways, Appointment::AUTHORIZE_NET_PAYMENT_METHOD, [
                'is_enabled'         => $this->isAuthorizeNetEnabled(),
                'service_fee_amount' => $this->is_service_fees_enabled ? Company::CB_SERVICE_FEE_AMOUNT : 0
            ]),
            Appointment::STRIPE_PAYMENT_METHOD        => Arr::set($paymentGateways, Appointment::STRIPE_PAYMENT_METHOD, [
                'is_enabled'      => $this->isStripeEnabled(),
                'publishable_key' => $this->settings()->get('integrations.stripe.publishable_key')
            ]),
        };

        return [
            'name'               => $this->name,
            'email'              => $this->email,
            'phone'              => $this->phone,
            'logo'               => new ImageResource($this->logo),
            'logo_rectangular'   => new ImageResource($this->logoRectangular),
            'service_categories' => ServiceCategoryResource::collection($this->whenLoaded('serviceCategories')),
            'slug'               => $this->slug,

            'filteredServices'  => ServiceResource::collection($this->whenLoaded('services')),
            'filteredLocations' => LocationResource::collection($this->whenLoaded('locations')),
            'filteredEmployees' => EmployeeResource::collection($this->whenLoaded('employees')),

            'services' => ServiceResource::collection($this->resource->services()->public()->with('images')->get()),
//            'locations' => LocationResource::collection($this->resource->locations()->get()),
//            'employees' => EmployeeResource::collection($this->resource->employees()->selfBook()->with('user')->get()),

            'settings' => $this->settings()->getMultiple([
                'widget',
                'appointments.no_show_deposit',
            ]),

            'payment_gws' => $paymentGateways
        ];
    }
}
