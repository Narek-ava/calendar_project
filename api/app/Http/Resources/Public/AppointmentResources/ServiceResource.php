<?php

namespace App\Http\Resources\Public\AppointmentResources;

use App\Http\Resources\ImageResource;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use JsonSerializable;

class ServiceResource extends JsonResource
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
            'id'                    => $this->id,
            'name'                  => $this->name,
            'images'                => ImageResource::collection($this->whenLoaded('images')),
            'is_reschedule_enabled' => $this->is_reschedule_enabled,
            'schedule'              => $this->schedule ? collect($this->schedule)->sortBy('id')->all() : null,
        ];
    }
}
