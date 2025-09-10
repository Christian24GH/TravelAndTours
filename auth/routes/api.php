<?php

use App\Http\Controllers\APIController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ApplicantController;
use App\Http\Controllers\HR1Controller;
use App\Http\Controllers\InterviewController;
use App\Http\Controllers\JobPostingController;
use App\Http\Controllers\Core\TourJobController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;

// Public Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Protected Auth routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Applicants & Interviews
    Route::apiResource('applicants', ApplicantController::class);
    Route::post('/applicants', [HR1Controller::class, 'storeApplicant']);
    Route::apiResource('interviews', InterviewController::class);

    // Job Postings (HR1 Offer Management)
    // HR1 Offer Management (Job Postings)
Route::get('/job-postings', [HR1Controller::class, 'jobs']);
Route::post('/job-postings', [HR1Controller::class, 'storeJob']);
Route::put('/job-postings/{id}', [HR1Controller::class, 'updateJob']);
Route::delete('/job-postings/{id}', [HR1Controller::class, 'deleteJob']);

});

// Public Jobs (core system)
Route::get('/core/jobs', [TourJobController::class, 'index']);

// Mobile Authentication (Driver login)
Route::post('/sanctum/token', function (Request $request) {
    $validated = $request->validate([
        'email' => 'required|email',
        'password' => 'required',
        'device_name' => 'required',
    ]);

    $user = User::where('email', $validated['email'])
                ->where('role', 'driver')
                ->first();

    if (!$user || !Hash::check($validated['password'], $user->password)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    return $user->createToken($validated['device_name'])->plainTextToken;
});

// Other APIs
Route::get('/getDrivers', [APIController::class, 'getDrivers']);
