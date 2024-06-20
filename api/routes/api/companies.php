<?php

use App\Http\Controllers\CompanyController;

Route::get('{company}/report', [CompanyController::class, 'report'])->middleware('can:viewReport,company');
Route::get('{company}/audits', [CompanyController::class, 'audits']);
Route::post('{company}/update-settings', [CompanyController::class, 'updateSettings']);
Route::get('{company}/twilio-phones', [CompanyController::class, 'twilioPhones']);
Route::patch('{company}/waiver/update', [CompanyController::class, 'updateWaiver']);
