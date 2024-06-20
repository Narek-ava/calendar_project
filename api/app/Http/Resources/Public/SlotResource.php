<?php

namespace App\Http\Resources\Public;

use Carbon\CarbonImmutable;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use JsonSerializable;

class SlotResource extends JsonResource
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
            'start_at' => CarbonImmutable::parse($this['start_at'])->toDateTimeString(),
            'end_at'   => CarbonImmutable::parse($this['end_at'])->toDateTimeString(),
            'employee' => [
                'id'               => $this['employee']->id,
                'profession_title' => $this['employee']->profession_title,
                'user'             => new UserResource($this['employee']->user),
            ],
            'occupied' => $this['occupied'],
            'debug'    => $this->when(isset($this['debug']), fn() => $this['debug']),
        ];
    }
}
