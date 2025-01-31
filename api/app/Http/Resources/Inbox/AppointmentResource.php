<?php

namespace App\Http\Resources\Inbox;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use JsonSerializable;

class AppointmentResource extends JsonResource
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
            'uuid'     => $this->uuid,
            'start_at' => $this->start_at,
            'service'  => ServiceResource::make($this->whenLoaded('service')),
        ];
    }
}
