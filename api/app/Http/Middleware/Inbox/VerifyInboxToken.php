<?php

namespace App\Http\Middleware\Inbox;

use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Throwable;

class VerifyInboxToken
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     * @return mixed
     * @throws Throwable
     */
    public function handle(Request $request, Closure $next): mixed
    {
        throw_if(
            $request->getHost() !== 'api' ||
            $request->bearerToken() !== env('INBOX_TO_CB_API_KEY'),
            AuthorizationException::class
        );

        return $next($request);
    }
}
