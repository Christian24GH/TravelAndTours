<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\logisticsII;
use App\Http\Middleware\CheckUser;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Support\Facades\Route;

Route::withoutMiddleware(HandleInertiaRequests::class)->group(function (){
    Route::get('/login', [LoginController::class, 'index'])->name('login');
    Route::post('/login', [LoginController::class, 'submit'])->name('login.submit');
    Route::get('/logout', [LoginController::class, 'logout'])->name('logout');
});

Route::middleware(CheckUser::class)->group(function (){
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/logisticsII', [logisticsII::class, 'index'])->name('logisticsII');
});

