<?php

use App\Http\Controllers\EmployeeController;

Route::post('check-email', [EmployeeController::class, 'checkEmail']);
Route::post('invite-existing-user', [EmployeeController::class, 'inviteExistingUser']);
Route::post('simplified-invite', [EmployeeController::class, 'storeSimplified']);
Route::post('{employee}/invite/resend', [EmployeeController::class, 'resendInvite'])->name('employee.invite.resend');

Route::match(['put', 'patch'], '{employee}/restore', [EmployeeController::class, 'restore'])->name('employees.restore');
Route::get('{employee}/audits', [EmployeeController::class, 'audits']);
