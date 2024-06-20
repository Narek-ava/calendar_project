<?php

namespace App\Http\Resources\Public\AppointmentResources;

use App\Http\Resources\Public\ImageResource;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use JsonSerializable;

class CompanyResource extends JsonResource
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
            'name'     => $this->name,
            'email'    => $this->email,
            'phone'    => $this->phone,
            'logo'     => new ImageResource($this->logo),
            'settings' => $this->settings()->getMultiple([
                'widget',
                'appointments.no_show_deposit',
            ]),
        ];
    }
}
