<?php

namespace App\Http\Resources\Public;

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
            'id'                               => $this->id,
            'service_category_id'              => $this->service_category_id,
            'name'                             => $this->name,
            'duration'                         => $this->duration,
            'interval'                         => $this->interval,
            'payment_type'                     => $this->payment_type,
            'price'                            => $this->price,
            'prepay'                           => $this->prepay,
            'is_private'                       => $this->is_private,
            'fixed_price'                      => $this->fixed_price,
            'description'                      => $this->description,
            'category'                         => new ServiceCategoryResource($this->whenLoaded('category')),
            'locations'                        => LocationResource::collection($this->whenLoaded('locations')),
            'employees'                        => EmployeeResource::collection($this->whenLoaded('employees')),
            'images'                           => ImageResource::collection($this->whenLoaded('images')),
            'is_reschedule_enabled'            => $this->is_reschedule_enabled,
            'schedule'                         => $this->schedule ? collect($this->schedule)->sortBy('id')->all() : null,
            'sorting_order'                    => $this->sorting_order,
            'rescheduling_interval'            => $this->rescheduling_interval,
            'slug'                             => $this->slug,
            'location_ids'                     => $this->locations->pluck('id'),
            'employee_ids'                     => $this->employees->pluck('id'),
            'is_virtual'                       => $this->is_virtual,
            'advance_booking_buffer'           => $this->advance_booking_buffer,
        ];
    }
}
