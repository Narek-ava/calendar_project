<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerContact extends Model
{
    use HasFactory;

    const EMAIL_TYPE = 'email';
    const PHONE_TYPE = 'phone';

    public static array $types = [
        self::EMAIL_TYPE,
        self::PHONE_TYPE,
    ];

    protected $fillable = ['type', 'value'];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
