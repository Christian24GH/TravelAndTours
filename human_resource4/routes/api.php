<?php

use App\Http\Controllers\EmployeesController;
use App\Http\Controllers\JobsController;
use App\Http\Controllers\PayrollController;
use Illuminate\Support\Facades\Route;

// ---------------- Employee Records ---------------- //
Route::prefix('employees')->group(function () {
    Route::get('/', [EmployeesController::class, 'show']);
    Route::get('/all', [EmployeesController::class, 'showAll']);
    Route::get('/search', [EmployeesController::class, 'search']);
    Route::post('/register', [EmployeesController::class, 'register']);
    Route::put('/update/{id}', [EmployeesController::class, 'update']);
});

// ---------------- Job & Position ---------------- //
Route::prefix('jobs')->group(function () {
    Route::get('/', [JobsController::class, 'index']);
    Route::post('/register', [JobsController::class, 'store']);
    Route::get('/search', [JobsController::class, 'show']);
    Route::put('/update/{id}', [JobsController::class, 'update']);
    Route::delete('/delete', [JobsController::class, 'destroy']);
});

Route::prefix('payroll')->group(function () {
    Route::get('/', [PayrollController::class, 'index']);
    Route::post('/calculate', [PayrollController::class, 'calculate']);
    Route::get('/{id}', [PayrollController::class, 'show']);
    Route::post('/{id}/process', [PayrollController::class, 'process']);
    Route::delete('/{id}', [PayrollController::class, 'destroy']);
});

// ---------------- Test Route ---------------- //
Route::get('/hello', function () {
    return 'Hello HR4 World!';
});
