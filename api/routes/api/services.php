<?php

use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\ServiceController;

Route::get('{service}/locations', [
    LocationController::class, 'locationsByService',
]);
Route::get('{service}/locations/{location}/employees', [
    EmployeeController::class, 'employeesByServiceLocation',
]);
Route::match(['put', 'patch'], '{service}/restore', [ServiceController::class, 'restore'])->name('services.restore');
Route::match(['put', 'patch'], 'updateSortingOrders', [ServiceController::class, 'updateSortingOrders']);
Route::get('{service}/audits', [ServiceController::class, 'audits']);
Route::post('simplified-store', [ServiceController::class, 'storeSimplified']);
