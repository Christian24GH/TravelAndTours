<?php

use App\Http\Controllers\Dispatches;
use App\Http\Controllers\Drivers;
use App\Http\Controllers\Reservations;
use App\Http\Controllers\Vehicles;
use Illuminate\Support\Facades\Route;

//Vehicles
Route::get('/vehicles', [Vehicles::class, 'show']);
Route::get('/vehicles/search', [Vehicles::class, 'search']);
Route::get('/vehicles/all', [Vehicles::class, 'showAll']);
Route::post('/vehicles/register', [Vehicles::class, 'register']);
Route::put('/vehicles/change', [Vehicles::class, 'update']);

//Reservations
Route::get('/reserve', [Reservations::class, 'index']);
Route::post('/reserve/details', [Reservations::class, 'details']);
Route::post('/reserve/submit', [Reservations::class, 'makeRequest']);
Route::put('/reserve/approve', [Reservations::class, 'approveReservation']);
Route::put('/reserve/cancel', [Reservations::class, 'cancelRequest']);

//Driver
Route::get('/drivers', [Drivers::class, 'show']);
Route::get('/drivers/dialogDrivers', [Drivers::class, 'dialogShow']);
Route::get('/drivers/getDrivers', [Drivers::class, 'get']);

//Dispatch
Route::get('/dispatches', [Dispatches::class, 'show']);
Route::get('/dispatches/driver', [Dispatches::class, 'showToDriver']);
Route::get('/dispatches/details', [Dispatches::class, 'dispatchDetails']);
Route::get('/dispatches/update', [Dispatches::class, 'updateStatus']);


