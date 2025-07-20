<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthenticationController;
use Illuminate\Support\Facades\DB;

Route::post('/register', [AuthenticationController::class, 'register'])->name('api_register');
Route::post('/login', [AuthenticationController::class, 'login'])->name('api_login');
Route::get('/check-db', function () {
    return DB::select('SHOW TABLES');
});
Route::middleware('auth:api')->group(function () {
    Route::get('/me', [AuthenticationController::class, 'me']);
    Route::post('/logout', [AuthenticationController::class, 'logOut']);
});