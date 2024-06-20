<?php

namespace App\Http\Resources\Public;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use JsonSerializable;

class AddressResource extends JsonResource
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
            'address'     => $this->address,
            'city'        => $this->city,
            'state'       => $this->state,
            'country'     => $this->country,
            'postal_code' => $this->postal_code,
        ];
    }
}
