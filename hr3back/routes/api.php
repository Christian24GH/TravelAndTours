<?php

use App\Http\Controllers\Maintenance;
use App\Http\Controllers\Vehicles;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::get('/vehicles', [Vehicles::class, 'show']);

Route::get('/hello', function () {
    return 'Hello World!';
});

// Attendance

// TIMESHEET

// SHIFT AND SCHEDULE

// LEAVE MANAGEMENT

// CLAIMS AND REIMBURSEMENTS