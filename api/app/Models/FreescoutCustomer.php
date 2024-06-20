<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FreescoutCustomer extends Model
{
    use HasFactory;

    protected $fillable = ['freescout_customer_id', 'freescout_source'];

    protected $casts = [
        'freescout_source' => 'boolean',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
