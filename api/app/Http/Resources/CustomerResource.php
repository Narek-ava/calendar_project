<?php

namespace App\Http\Resources;

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
            'id'           => $this->id,
            'firstname'    => $this->firstname,
            'lastname'     => $this->lastname,
            'email'        => $this->email,
            'phone'        => $this->phone,
            'birth_date'   => $this->when($this->birth_date, fn() => $this->birth_date, null),
            'note'         => $this->note,
            'address'      => new AddressResource($this->whenLoaded('address')),
            'contacts'     => CustomerContactResource::collection($this->whenLoaded('contacts')),
            'deleted_at'   => $this->deleted_at,
            'appointments' => AppointmentResource::collection($this->whenLoaded('appointments')),
        ];
    }
}
