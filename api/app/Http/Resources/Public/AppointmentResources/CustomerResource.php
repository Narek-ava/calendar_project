<?php

namespace App\Http\Resources\Public\AppointmentResources;

use App\Http\Resources\Public\AppointmentResource;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use JsonSerializable;

class CustomerResource extends JsonResource
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
            'firstname'    => $this->firstname,
            'lastname'     => $this->lastname,
            'appointments' => AppointmentResource::collection($this->whenLoaded('appointments')),
        ];
    }
}
