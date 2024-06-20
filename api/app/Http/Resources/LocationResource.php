<?php

namespace App\Http\Resources;

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
            'id'            => $this->id,
            'name'          => $this->name,
            'phone'         => $this->phone,
            'schedule'      => $this->schedule ? collect($this->schedule)->sortBy('id')->all() : null,
            'time_zone'     => $this->time_zone,
            'is_primary'    => $this->is_primary,
            'employees'     => EmployeeResource::collection($this->whenLoaded('employees')),
            'services'      => ServiceResource::collection($this->whenLoaded('services')),
            'address'       => new AddressResource($this->address),
            'deleted_at'    => $this->deleted_at,
            'slug'          => $this->slug,
            'kioskUrlShort' => $this->getShortUrl('kioskUrl'),
            'twilio_phone'  => $this->twilio_phone,
        ];
    }
}
