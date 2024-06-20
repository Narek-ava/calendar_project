<?php

namespace App\Http\Resources\Public;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use JsonSerializable;

class ServiceCategoryResource extends JsonResource
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
            'id'       => $this->id,
            'name'     => $this->name,
            'services' => ServiceResource::collection($this->whenLoaded('services')),
        ];
    }
}
