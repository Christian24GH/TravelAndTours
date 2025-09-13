<?php

use App\Http\Controllers\APIController;
use App\Http\Controllers\AuthController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LMController;
use App\Http\Controllers\TMController;
use App\Http\Controllers\ESSController;
use App\Http\Controllers\CMController;
use App\Http\Controllers\SPController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/csrf-token', function (Request $request) {
        return response()->json(['csrfToken' => csrf_token()]);
    });
    Route::get('/user', [AuthController::class, 'user'])->name('user');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // ----HR2 API----
    // Learning Management
    Route::get('/learning', [LMController::class, 'index']);
    Route::post('/learning', [LMController::class, 'store']);
    Route::put('/learning/{id}', [LMController::class, 'update']);
    Route::delete('/learning/{id}', [LMController::class, 'destroy']);
    Route::get('/learning/{id}/quiz', [LMController::class, 'getQuiz']);
    Route::post('/learning/quiz-result', [LMController::class, 'saveQuizResult']);
    // Competency Management
    Route::get('/competency', [CMController::class, 'index']);
    Route::post('/competency', [CMController::class, 'store']);
    // Training Management
    Route::get('/training', [TMController::class, 'index']);
    Route::post('/training', [TMController::class, 'store']);
    Route::put('/training/{id}', [TMController::class, 'update']);
    Route::delete('/training/{id}', [TMController::class, 'destroy']);
    // Succession Planning
    Route::get('/succession', [SPController::class, 'index']);
    Route::get('/succession/candidates', [SPController::class, 'candidates']);
    // Employee Self Service
    Route::get('/employees', [ESSController::class, 'listEmployees']);
    Route::get('/employees/{id}', [ESSController::class, 'showEmployee']);
    Route::post('/employees', [ESSController::class, 'createEmployee']);
    Route::put('/employees/{id}', [ESSController::class, 'updateEmployee']);
    Route::delete('/employees/{id}', [ESSController::class, 'deleteEmployee']);
    Route::get('/leave-requests', [ESSController::class, 'index']);
    Route::post('/leave-requests', [ESSController::class, 'store']);
    Route::patch('/leave-requests/{leaveRequest}', [ESSController::class, 'update']);


    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

//Mobile Authentication
Route::post('/sanctum/token', function (Request $request) {
    $validated = (object) $request->validate([
        'email' => 'required|email',
        'password' => 'required',
        'device_name' => 'required',
    ]);
 
    $user = User::where('email', $validated->email)
            ->where('role', 'driver')
            ->first();

    if (!$user || $validated->password != $user->password) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }
 
    return $user->createToken($request->device_name)->plainTextToken;
});

Route::get('/getDrivers', [APIController::class, 'getDrivers']);
