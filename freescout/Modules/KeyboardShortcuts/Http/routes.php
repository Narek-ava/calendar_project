<?php

Route::group(['middleware' => 'web', 'prefix' => \Helper::getSubdirectory(), 'namespace' => 'Modules\KeyboardShortcuts\Http\Controllers'], function () {
    Route::get(KS_MODULE.'-help', fn() => view(KS_MODULE.'::partials/help'))->name(KS_MODULE . '.help');
});
