<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class CompanyOwner extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'subscription_type'];

    public function companies(): HasMany
    {
        return $this->hasMany(Company::class);
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function employees(): HasManyThrough
    {
        return $this->hasManyThrough(Employee::class, Company::class);
    }
}
