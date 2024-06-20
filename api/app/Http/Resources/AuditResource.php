<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;
use JsonSerializable;

class AuditResource extends JsonResource
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
            'event'           => $this->event,
            'old_values'      => $this->old_values,
            'new_values'      => $this->new_values,
            'modified_values' => $this->getModified(),
            'created_at'      => $this->created_at,
            'user'            => $this->when($this->user_id, fn() => new UserResource(User::withTrashed()->find($this->user_id))),
            'event_source'    => $this->when($this->user_id, fn() => Str::contains($this->url, '/public') ? 'widget' : 'backoffice', 'widget')
        ];
    }
}
