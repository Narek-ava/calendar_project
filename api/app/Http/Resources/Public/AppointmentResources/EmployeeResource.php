<?php

namespace App\Http\Resources\Public\AppointmentResources;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use JsonSerializable;

class EmployeeResource extends JsonResource
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
            'id'   => $this->id,
            'user' => new UserResource($this->whenLoaded('user')),
            'is_shifts_enabled' => $this->is_shifts_enabled,
            'shifts'            => $this->shifts,
            'schedule'          => $this->schedule ? collect($this->schedule)->sortBy('id')->all() : null,
            'settings'          => $this->settings()->getMultiple(['widget']),
        ];
    }
}
