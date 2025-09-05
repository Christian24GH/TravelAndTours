<?php

use App\Http\Controllers\APIController;
use App\Http\Controllers\AuthController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApplicantController;
use App\Http\Controllers\InterviewController;
use App\Http\Controllers\Core\TourJobController;

Route::get('/applicants', [ApplicantController::class, 'index']);
Route::post('/applicants', [ApplicantController::class, 'store']);
Route::delete('/applicants/{id}', [ApplicantController::class, 'destroy']);

Route::get('/interviews', [InterviewController::class, 'index']);
Route::post('/interviews', [InterviewController::class, 'store']);
Route::put('/interviews/{id}', [InterviewController::class, 'update']);
Route::delete('/interviews/{id}', [InterviewController::class, 'destroy']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::get('/core/jobs', [TourJobController::class, 'index']);

Route::get('/job-postings', [JobPostingController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
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