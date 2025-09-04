<?php

use App\Http\Controllers\Maintenance;
use App\Http\Controllers\Vehicles;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EmployeeController;

Route::apiResource('employees', EmployeeController::class);

Route::get('/vehicles', [Vehicles::class, 'show']);

Route::get('/hello', function () {
    return 'Hello World!';
});

Route::get('/vehicles/search', [Vehicles::class, 'search']);
Route::get('/vehicles/all', [Vehicles::class, 'showAll']);
Route::post('/vehicles/register', [Vehicles::class, 'register']);
Route::put('/vehicles/change', [Vehicles::class, 'update']);

Route::post('/maintenance/add', [Maintenance::class, 'add']);
Route::put('/maintenance/change', [Maintenance::class, 'update']);