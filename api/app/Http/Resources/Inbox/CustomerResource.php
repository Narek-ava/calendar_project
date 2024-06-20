<?php

namespace App\Http\Resources\Inbox;

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
            'id'                   => $this->id,
            'firstname'            => $this->firstname,
            'lastname'             => $this->lastname,
            'email'                => $this->email,
            'phone'                => $this->phone,
            'upcomingAppointments' => AppointmentResource::collection($this->whenLoaded('appointments')),
        ];
    }
}