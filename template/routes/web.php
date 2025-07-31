<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;



Route::get('/', function () {
    return Inertia::render('dashboard');
})->name('dashboard');
Route::get('/p2', function () {
    return Inertia::render('page2');
})->name('page2');