<?php

namespace App\Http\Resources;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Arr;
use JsonSerializable;

class GlobalAppointmentListResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array|Arrayable|JsonSerializable
     */
    public function toArray($request): array|JsonSerializable|Arrayable
    {
        // Return appointment list resource in case if authorized user is owner of this appointment
        if (auth()->user()->id === $this->employee->user->id) {
            $result = (new AppointmentListResource($this->resource->load([
                'companyTrashed',
                'employeeTrashed.user', 'locationTrashed', 'serviceTrashed', 'customerTrashed.address', 'images'
            ])))->toArray($request);

            Arr::set($result, 'foreign_employee', [
                'id' => $this->employee->user->employees->firstWhere('company_id', auth()->user()->contextCompany->id)->id,
            ]);

            return $result;
        }

        return [
            'id'               => $this->id,
            'company'          => [
                'id'   => $this->company->id,
                'name' => $this->company->name
            ],
            'employee'         => [
                'id' => $this->employee->id,
            ],
            'start_at'         => $this->start_at,
            'end_at'           => $this->end_at,
            'type'             => $this->type,
            'foreign_employee' => [
                'id' => $this->employee->user->employees->firstWhere('company_id', auth()->user()->contextCompany->id)->id,
            ],
        ];
    }
}
