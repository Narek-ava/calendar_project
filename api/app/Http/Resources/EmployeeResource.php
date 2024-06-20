<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Arr;
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
            'id'                 => $this->id,
            'role'               => $this->user->role?->name,
            'status'             => $this->status,
            'profession_title'   => $this->profession_title,
            'background_color'   => $this->background_color,
            'text_color'         => $this->text_color,
            'self_book'          => $this->self_book,
            'user'               => new UserResource($this->whenLoaded('user')),
            'schedule'           => $this->schedule ? collect($this->schedule)->sortBy('id')->all() : null,
            'locations'          => LocationResource::collection($this->whenLoaded('locations')),
            'services'           => ServiceResource::collection($this->whenLoaded('services')),
            'company'            => new CompanyResource($this->whenLoaded('company')),
            'deleted_at'         => $this->deleted_at,
            'is_shifts_enabled'  => $this->is_shifts_enabled,
//            'shifts'            => $this->shifts,
            // TODO: tmp for migrating from old timepicker to new
            'shifts'             => Arr::map($this->shifts ?? [], function ($shift) {
                return [
                    ...$shift,
                    'start' => Carbon::parse(Arr::get($shift, 'start'))->toDateTimeString(),
                    'end'   => Carbon::parse(Arr::get($shift, 'end'))->toDateTimeString(),
                ];
            }),
            'slug'               => $this->slug,
            'avatar'             => new ImageResource($this->avatar),
            'locations_count'    => $this->locations_count,
            'is_invite_accepted' => $this->is_invite_accepted,
            'settings'           => $this->settings()->getMultiple(['widget']),
        ];
    }
}
