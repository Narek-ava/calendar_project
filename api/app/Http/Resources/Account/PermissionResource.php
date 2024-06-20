<?php

namespace App\Http\Resources\Account;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use JsonSerializable;

class PermissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array|Arrayable|JsonSerializable
     */
    public function toArray($request): array|JsonSerializable|Arrayable
    {
        [$subject, $action] = explode('.', $this->name);

        return [
            'subject' => $subject,
            'action'  => $action,
        ];
    }
}
