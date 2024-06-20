<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function (User $user, $id) {
    return (int)$user->id === (int)$id;
});

Broadcast::channel('App.Models.Company.{companyId}', function (User $user, $companyId) {
    return (int)$user->context_company_id === (int)$companyId;
});