<?php

use App\Http\Controllers\API\PageController;
use Illuminate\Support\Facades\Route;


Route::get('/login', [PageController::class, 'login'])->name('login');
Route::get('/register', [PageController::class, 'register'])->name('register');

