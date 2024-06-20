<?php

use App\Http\Controllers\Public\AppController;
use App\Http\Controllers\Public\AppointmentController;
use App\Http\Controllers\Public\CompanyController;
use App\Http\Controllers\Public\EmployeeController;
use App\Http\Controllers\Public\LocationController;
use App\Http\Controllers\Public\ServiceController;
use App\Http\Requests\Public\Appointment\AppointmentCustomerRequest;

Route::prefix('company/{publicCompany:slug}')->group(function () {

    /*
     * TODO: for more readable urls
     * companyService can be replaced with service like here and for location and employee to
     * Route::resource('service', ServiceController::class)->only(['index', 'show'])->parameter('service', 'companyService');
     */
    Route::resource('companyService', ServiceController::class)->only(['index', 'show']);
    Route::resource('companyLocation', LocationController::class)->only(['index', 'show']);
    Route::resource('companyEmployee', EmployeeController::class)->only(['index', 'show']);

    Route::prefix('appointment')->group(function () {
        Route::get('slots', [AppointmentController::class, 'slots']);
        Route::post('/', [AppointmentController::class, 'store']);
        Route::get('{companyAppointment:uuid}', [AppointmentController::class, 'show']);

        Route::match(['put', 'patch'], '{companyAppointment:uuid}', [AppointmentController::class, 'update']);
        Route::match(['put', 'patch'], '{companyAppointment:uuid}/status', [AppointmentController::class, 'status']);

        Route::post('validate-customer-info', [AppointmentController::class, 'validateCustomerInfo']);
        Route::post('stripe-payment-intent', [AppointmentController::class, 'stripePaymentIntent']);
    });

    // TODO: get rid of this shit
    Route::get(
        'service/{companyService}/location/{serviceLocation}/employees',
        [CompanyController::class, 'employees']
    );

    Route::post('/tripetto-webhook', [CompanyController::class, 'handleTripettoWebhook']);
});

// The company binding is used for backoffice routes
Route::resource('company', CompanyController::class)->only(['show'])->parameter('company', 'publicCompany');
Route::post('/tva-token', [AppointmentController::class, 'tvaToken']);
Route::get('/app-init', [AppController::class, 'show']);
