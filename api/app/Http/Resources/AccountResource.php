<?php

namespace App\Http\Resources;

use App\Http\Resources\Account\CompanyOwnerResource;
use App\Http\Resources\Account\CompanyResource as AccountCompanyResource;
use App\Http\Resources\Account\ContextCompanyResource;
use App\Http\Resources\Account\EmployeeResource as AccountEmployeeResource;
use App\Http\Resources\Account\Google\GoogleAccountResource;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;
use JsonSerializable;

class AccountResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array|Arrayable|JsonSerializable
     */
    public function toArray($request): array|JsonSerializable|Arrayable
    {
        $manager = app('impersonate');

        return [
            'select_company_required' => $this->when($this->canImpersonate() && !$manager->isImpersonating(), true),
            'is_impersonated'         => $this->when($this->isImpersonated(), true),
            'impersonator'            => $this->when($this->isImpersonated(), new UserResource($manager->getImpersonator())),

            'id'                        => $this->id,
            'firstname'                 => $this->firstname,
            'lastname'                  => $this->lastname,
            'email'                     => $this->email,
            'phone'                     => $this->phone,
            'avatar'                    => new ImageResource($this->avatar),
            'employee'                  => new AccountEmployeeResource($this->whenLoaded('employee')),
            'companies'                 => AccountCompanyResource::collection($this->whenLoaded('companies')),
            'companyOwner'              => new CompanyOwnerResource($this->whenLoaded('companyOwner')),
            'currentCompany'            => new ContextCompanyResource($this->whenLoaded('contextCompany')),
            'stripe_billing_portal_url' => $this->when($this->stripe_id, URL::signedRoute('stripe.billing-portal', $this), null),
            'google_accounts'           => GoogleAccountResource::collection($this->googleAccounts),
        ];
    }
}
