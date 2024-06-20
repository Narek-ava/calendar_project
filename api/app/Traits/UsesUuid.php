<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Str;

trait UsesUuid
{
    protected static function bootUsesUuid(): void
    {
        static::creating(function ($model) {
            if (!$model->getKey()) {
                $model->{$model->uuidColumn()} = (string) Str::uuid();
            }
        });
    }

    public function uuidColumn(): string
    {
        return 'uuid';
    }

    public function getKeyType(): string
    {
        return 'string';
    }

    public function scopeWhereUuid($query, $uuid): Builder
    {
        return $query->where($this->uuidColumn(), $uuid);
    }
}
