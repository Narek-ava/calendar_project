<?php

use App\Http\Controllers\Kiosk\KioskController;

Route::get('{kioskLocation}/check-in/{kioskAppointment}', [KioskController::class, 'checkIn'])->name('kiosk.check-in');
Route::post('{kioskLocation}/appointments', [KioskController::class, 'results'])->name('kiosk.appointments');
Route::get('{kioskLocation}', [KioskController::class, 'search'])->name('kiosk.search');
Route::post('{kioskLocation}/appointments/{kioskAppointment}/saveSurveyData', [KioskController::class, 'saveSurveyData'])->name('kiosk.save-survey-data');
