<?php

namespace App\Http\Resources\Public\AppointmentResources;

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
            'id'        => $this->id,
            'name'      => $this->name,
            'phone'     => $this->phone,
            'time_zone' => $this->time_zone,
            'address'   => new AddressResource($this->address),
            'schedule'     => $this->schedule ? collect($this->schedule)->sortBy('id')->all() : null,
        ];
    }
}
