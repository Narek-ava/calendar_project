<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FreescoutAccount extends Model
{
    use HasFactory;

    /**
     * Roles.
     */
    const ROLE_USER = 1;
    const ROLE_ADMIN = 2;

    protected $fillable = ['freescout_user_id', 'role'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
