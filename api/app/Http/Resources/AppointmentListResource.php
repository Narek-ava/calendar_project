<?php

namespace App\Http\Resources;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use JsonSerializable;

class AppointmentListResource extends JsonResource
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
            'id'                       => $this->id,
            'company'                  => new CompanyResource($this->whenLoaded('companyTrashed')),
            'employee'                 => new EmployeeResource($this->whenLoaded('employeeTrashed')),
            'service'                  => new ServiceResource($this->whenLoaded('serviceTrashed')),
            'location'                 => new LocationResource($this->whenLoaded('locationTrashed')),
            'customer'                 => new CustomerResource($this->whenLoaded('customerTrashed')),
            'images'                   => ImageResource::collection($this->whenLoaded('images')),
//            'payment_type'   => $this->payment_type,
//            'payment_method' => $this->payment_method,
//            'fixed_price'    => $this->fixed_price,
            'price'                    => $this->price,
//            'prepay'         => $this->prepay,
            'status'                   => $this->status,
            'start_at'                 => $this->start_at,
            'end_at'                   => $this->end_at,
            'type'                     => $this->type,
            'note'                     => $this->note,
//            'cancel_reason'  => $this->cancel_reason,
            'private_note'             => $this->private_note,
            'is_checked_in'            => $this->is_checked_in,
            'is_notifications_enabled' => $this->is_notifications_enabled,
        ];
    }
}
