<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response('Auth Service Running', 200);
});

Route::get('/login', function () {
    return response('Unauthorized', 401);
})->name('login');
