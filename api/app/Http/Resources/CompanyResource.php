<?php

namespace App\Http\Resources;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
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
        return [
            'id'                => $this->id,
            'uuid'              => $this->uuid,
            'slug'              => $this->slug,
            'name'              => $this->name,
            'email'             => $this->email,
            'phone'             => $this->phone,
            'site'              => $this->site,
            'locations_count'   => $this->locations()->count(),
            'employees_count'   => $this->employees()->count(),
            'services_count'    => $this->services()->count(),
            'address'           => new AddressResource($this->whenLoaded('address')),
            'logo'              => new ImageResource($this->logo),
            'logo_rectangular'  => new ImageResource($this->logoRectangular),
            'deleted_at'        => $this->deleted_at,
            'settings'          => $this->settings()->all(),
            'locations'         => LocationResource::collection($this->whenLoaded('locations')),
            'services'          => ServiceResource::collection($this->whenLoaded('services')),
            'employees'         => EmployeeResource::collection($this->whenLoaded('employees')),
            'owner'             => new UserResource($this->whenLoaded('owner')),
            'is_twilio_enabled' => $this->is_twilio_enabled
        ];
    }
}
