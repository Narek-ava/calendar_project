<?php

namespace App\Http\Resources\Public;

use App\Http\Resources\Public\AppointmentResources\CompanyResource;
use App\Http\Resources\Public\AppointmentResources\CustomerResource;
use App\Http\Resources\Public\AppointmentResources\EmployeeResource;
use App\Http\Resources\Public\AppointmentResources\LocationResource;
use App\Http\Resources\Public\AppointmentResources\ServiceResource;
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
            'uuid'      => $this->uuid,
            'status'    => $this->status,
            'start_at'  => $this->start_at,
            'end_at'    => $this->end_at,
            'time_zone' => $this->time_zone,
            'note'      => $this->note,
            'price'     => $this->price,

            // Be careful there are another resources, with minimal data
            // Think twice in case if you need to add a new field to response
            'company'   => new CompanyResource($this->whenLoaded('company')),
            'employee'  => new EmployeeResource($this->whenLoaded('employeeTrashed')),
            'service'   => new ServiceResource($this->whenLoaded('serviceTrashed')),
            'location'  => new LocationResource($this->whenLoaded('locationTrashed')),
            'customer'  => new CustomerResource($this->whenLoaded('customerTrashed')),

            'is_in_rescheduling_or_canceling_interval' => $this->isInReschedulingOrCancelingInterval(),


        ];
    }
}
