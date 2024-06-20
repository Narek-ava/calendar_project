<?php

namespace App\Http\Resources\Account;

use App\Http\Resources\ImageResource;
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
            'id'              => $this->id,
            'uuid'            => $this->uuid,
            'slug'            => $this->slug,
            'name'            => $this->name,
            'logo'            => new ImageResource($this->logo),
        ];
    }
}
