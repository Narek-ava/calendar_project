<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Laravel\Nova\Actions\Actionable;

class Address extends Model
{
    use HasFactory, Actionable;

    protected $fillable = ['address', 'city', 'state', 'country', 'postal_code', 'l1', 'l2'];

    public function resource(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Interact with the user's address.
     *
     * @return  Attribute
     */
    protected function full(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => implode(', ', array_filter($this->only(['l1', 'l2', 'city', 'state', 'postal_code']))),
        );
    }
}
