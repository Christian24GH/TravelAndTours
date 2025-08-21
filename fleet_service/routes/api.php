<?php

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
Route::get('/reserve', [Reservations::class, 'show']);
Route::post('/reserve/submit', [Reservations::class, 'makeRequest']);
Route::put('/reserve/change', [Reservations::class, 'changeRequest']);
Route::put('/reserve/approve', [Reservations::class, 'approveReservation']);
Route::put('/reserve/cancel', [Reservations::class, 'cancelRequest']);
Route::put('/reserve/update', [Reservations::class, 'updateStatus']);


//Driver
Route::get('/drivers', [Drivers::class, 'show']);