<?php

namespace App\Http\Resources\Public;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use JsonSerializable;

class LocationResource extends JsonResource
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
            'id'           => $this->id,
            'name'         => $this->name,
            'phone'        => $this->phone,
            'schedule'     => $this->schedule ? collect($this->schedule)->sortBy('id')->all() : null,
            'time_zone'    => $this->time_zone,
            'address'      => new AddressResource($this->address),
            'slug'         => $this->slug,
            'services'     => ServiceResource::collection($this->whenLoaded('services')),
            'employees'    => EmployeeResource::collection($this->whenLoaded('employees')),
            'service_ids'  => $this->services->pluck('id'),
            'employee_ids' => $this->employees->pluck('id'),
        ];
    }
}
