<?php

use App\Http\Controllers\ImageUploaderController;

Route::post('image', ImageUploaderController::class);
Route::delete('image/{image}', [ImageUploaderController::class, 'destroy']);
Route::delete('image-by-link', [ImageUploaderController::class, 'destroyByLink']);
