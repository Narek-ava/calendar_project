<?php

namespace App\Traits;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

trait FilterByRole
{
    abstract public function scopeFilterByRole(Builder $query, User $user);
}
