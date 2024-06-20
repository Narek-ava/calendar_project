<?php

use App\Http\Controllers\CustomerController;

Route::get('export', [CustomerController::class, 'export'])->middleware('can:customer.view');
Route::get('{customer}/audits', [CustomerController::class, 'audits']);


