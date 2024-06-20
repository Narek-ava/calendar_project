<?php

namespace App\Http\Resources\Account;

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
            'id'               => $this->id,
            'role'             => new RoleResource($this->user->role->load('permissions')),
            'status'           => $this->status,
            'profession_title' => $this->profession_title,
            'background_color' => $this->background_color,
            'text_color'       => $this->text_color,
            'self_book'        => $this->self_book,
            'schedule'         => $this->schedule ? collect($this->schedule)->sortBy('id')->all() : null,
            'locations'        => LocationResource::collection($this->whenLoaded('locations')),
            'services'         => ServiceResource::collection($this->whenLoaded('services')),
            'deleted_at'       => $this->deleted_at,
            'settings'         => $this->settings()->getMultiple(['calendar']),
        ];
    }
}
