<?php

use App\Http\Controllers\LocationController;

Route::match(['put', 'patch'], '{location}/restore', [LocationController::class, 'restore'])->name('locations.restore');
Route::get('{location}/audits', [LocationController::class, 'audits']);
