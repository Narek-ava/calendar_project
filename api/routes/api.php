<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\Mailbox\MailboxController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\ServiceCategoryController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\VerificationController;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::prefix('public')->group(base_path('routes/api/public.php'));
Route::get('/employees/invite/{token}', [EmployeeController::class, 'inviteVerify'])->name('employees.invite.verify');
Route::post('/validate-register', [RegisterController::class, 'validateRegisterForm']);

// Stripe
Route::get('/stripe-success', [RegisterController::class, 'handleStripeSuccess']);
Route::get('/stripe-typ', [RegisterController::class, 'handleStripeThankYouPage']);
Route::get('/stripe-billing-portal/{user}', [AccountController::class, 'stripeBillingPortal'])->name('stripe.billing-portal');

Route::prefix('google')->group(base_path('routes/google.php'));
Route::prefix('uploader')->group(base_path('routes/api/uploader.php'));

Route::group(['middleware' => ['auth:sanctum', 'context']], function () {
    Route::get('email/verify/{id}', VerificationController::class)->name('verification.verify');
    Route::prefix('account')->group(base_path('routes/api/account.php'));

    Route::apiResource('mailboxes', MailboxController::class);
    Route::prefix('mailboxes')->group(base_path('routes/api/mailboxes.php'));

    Route::prefix('companies')->group(base_path('routes/api/companies.php'));
    Route::apiResource('companies', CompanyController::class);

    Route::prefix('locations')->group(base_path('routes/api/locations.php'));
    Route::apiResource('locations', LocationController::class);

    Route::apiResource('service-categories', ServiceCategoryController::class);

    Route::prefix('services')->group(base_path('routes/api/services.php'));
    Route::apiResource('services', ServiceController::class);

    Route::prefix('employees')->group(base_path('routes/api/employees.php'));
    Route::apiResource('employees', EmployeeController::class);

    Route::prefix('customers')->group(base_path('routes/api/customers.php'));
    Route::apiResource('customers', CustomerController::class);

    Route::prefix('appointments')->group(base_path('routes/api/appointments.php'));
    Route::apiResource('appointments', AppointmentController::class);
    Route::get('global-appointments', [AppointmentController::class, 'globalAppointments']);
});
