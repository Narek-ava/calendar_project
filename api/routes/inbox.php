<?php

use App\Http\Controllers\Inbox\CompanyController;

Route::post('companies/{company}/search-customer', [CompanyController::class, 'searchCustomer']);
Route::apiResource('companies', CompanyController::class)->only('index');
