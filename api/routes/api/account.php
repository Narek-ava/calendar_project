<?php

use App\Http\Controllers\Account\GoogleAccountController;
use App\Http\Controllers\Account\ImpersonateController;
use App\Http\Controllers\Account\NotificationController;
use App\Http\Controllers\AccountController;

Route::get('/', AccountController::class);
Route::post('/', [AccountController::class, 'update']);
Route::post('/password', [AccountController::class, 'changePassword']);
Route::post('/change-company', [AccountController::class, 'changeContextCompany']);
Route::get('/locations', [AccountController::class, 'locations']);

Route::get('get-employee-settings', [AccountController::class, 'showEmployeeSettings']);
Route::post('update-employee-settings', [AccountController::class, 'updateEmployeeSettings']);

Route::post('impersonate', [ImpersonateController::class, 'impersonate']);
Route::get('impersonate-leave', [ImpersonateController::class, 'leave']);

Route::get('/notifications', NotificationController::class);
Route::get('/notifications/all-read', [NotificationController::class, 'markAllRead']);
Route::get('/notification/{notification}/read', [NotificationController::class, 'markRead']);

Route::prefix('google')->controller(GoogleAccountController::class)->group(function () {
    Route::get('auth-url', 'authUrl');
    Route::post('attach', 'store');
    Route::delete('detach', 'destroy');

    Route::patch('select-calendars/{googleAccount}', 'selectCalendars');
});
