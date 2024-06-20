<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

/**
 * @group Services
 */
class VerificationController extends Controller
{
    public function __invoke($user_id, Request $request)
    {
        if (!$request->hasValidSignature(false)) {
            return response()->json(['message' => 'Invalid/Expired url provided.'], 401);
        }

        $user = User::findOrFail($user_id);

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        return response(['message' => 'Verified'], 200);
    }
}
