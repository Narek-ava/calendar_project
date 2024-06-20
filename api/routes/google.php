<?php

use App\Http\Controllers\GoogleGuestController;

Route::get('oauth', [GoogleGuestController::class, 'oauth'])->name('google.oauth');
Route::post('webhook', [GoogleGuestController::class, 'webhook'])->name('google.webhook');
