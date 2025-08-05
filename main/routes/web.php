<?php

use App\Http\Controllers\Authentication;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('landing');
});

Route::get('/login', [Authentication::class, 'loginView'])->name('login');
Route::get('/register', [Authentication::class, 'registerView']);
Route::post('/register', [Authentication::class, 'register']);