<?php

use App\Http\Controllers\AppointmentController;

Route::match(['put', 'patch'], '{appointment}/status', [AppointmentController::class, 'status']);
Route::match(['put', 'patch'], '{appointment}/payments', [AppointmentController::class, 'payments']);
Route::get('{appointment}/audits', [AppointmentController::class, 'audits']);
