<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
        //
        // TODO: Add CSRF protection for TVA
        'public/*',
        'uploader/*',
//        'public/tva-token',
//        'public/company/*',
        'stripe/*',
        'google/oauth',
        'google/webhook',
    ];
}
