<?php

namespace App\Http\Resources\Account\Google;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use JsonSerializable;

class GoogleAccountResource extends JsonResource
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
            'calendars' => GoogleCalendarResource::collection($this->calendars),
        ];
    }
}
