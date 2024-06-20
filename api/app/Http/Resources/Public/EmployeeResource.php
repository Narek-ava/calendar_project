<?php

namespace App\Http\Resources\Public;

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
            'id'                => $this->id,
            'profession_title'  => $this->profession_title,
            'schedule'          => $this->schedule ? collect($this->schedule)->sortBy('id')->all() : null,
            'user'              => new UserResource($this->whenLoaded('user')),
            'is_shifts_enabled' => $this->is_shifts_enabled,
            'shifts'            => $this->shifts,
            'slug'              => $this->slug,
            'services'          => ServiceResource::collection($this->whenLoaded('services')),
            'locations'         => LocationResource::collection($this->whenLoaded('locations')),
            'service_ids'       => $this->services->pluck('id'),
            'location_ids'      => $this->locations->pluck('id'),
            'avatar'            => new ImageResource($this->avatar),
            'settings'          => $this->settings()->getMultiple(['widget']),
        ];
    }
}
