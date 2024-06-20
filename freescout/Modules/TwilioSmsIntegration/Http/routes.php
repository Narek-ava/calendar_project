<?php

// Webhook.
use Modules\TwilioSmsIntegration\Providers\TwilioSmsIntegrationServiceProvider;

Route::group([
    'prefix'     => \Helper::getSubdirectory(),
    'namespace'  => 'Modules\TwilioSmsIntegration\Http\Controllers',
    'middleware' => ['bindings']
], function () {
    Route::match(['get', 'post'], '/' . TwilioSmsIntegrationServiceProvider::MODULE_NAME . '/webhook/{mailbox}/{mailbox_secret}', 'TwilioSmsIntegrationController@webhooks')->name(TwilioSmsIntegrationServiceProvider::MODULE_NAME . '.webhook');
});

// Admin.
Route::group([
    'middleware' => 'web',
    'prefix'     => \Helper::getSubdirectory(),
    'namespace'  => 'Modules\TwilioSmsIntegration\Http\Controllers'
], function () {
    Route::get('/mailbox/{mailbox}/' . TwilioSmsIntegrationServiceProvider::MODULE_NAME, ['uses' => 'TwilioSmsIntegrationController@settings', 'middleware' => ['auth', 'roles'], 'roles' => ['admin']])->name('mailboxes.' . TwilioSmsIntegrationServiceProvider::MODULE_NAME . '.settings');
    Route::post('/mailbox/{mailbox}/' . TwilioSmsIntegrationServiceProvider::MODULE_NAME, ['uses' => 'TwilioSmsIntegrationController@settingsSave', 'middleware' => ['auth', 'roles'], 'roles' => ['admin']]);
});
