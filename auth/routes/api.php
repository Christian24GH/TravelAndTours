<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompetencyController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\LearningController;
use App\Http\Controllers\TrainingController;
use App\Http\Controllers\SuccessionController;
use App\Http\Controllers\SelfServiceController;

// Public routes for authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Authenticated routes (protected by Sanctum middleware)
Route::middleware('auth:sanctum')->group(function () {
    // Moved the csrf-token route inside the authenticated group
    Route::get('/csrf-token', function (Request $request) {
        return response()->json(['csrfToken' => csrf_token()]);
    });
    
    Route::get('/user', [AuthController::class, 'user'])->name('user');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // HR2 routes from your previous system
    Route::get('/competency', [CompetencyController::class, 'index'])->name('competency.index');
    Route::post('/competency', [CompetencyController::class, 'store'])->name('competency.store');
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::post('/employees', [EmployeeController::class, 'store'])->name('employees.store');
    Route::get('/employees/{id}', [EmployeeController::class, 'show'])->name('employees.show');
    Route::patch('/employees/{id}', [EmployeeController::class, 'update'])->name('employees.update');
    Route::post('/employees/{id}/photo', [EmployeeController::class, 'uploadPhoto'])->name('employees.uploadPhoto');
    Route::delete('/employees/{id}', [EmployeeController::class, 'destroy'])->name('employees.destroy');
    Route::get('/learning', [LearningController::class, 'index'])->name('learning.index');
    Route::get('/training', [TrainingController::class, 'index'])->name('training.index');
    Route::get('/succession', [SuccessionController::class, 'index'])->name('succession.index');
    // HR2Employee Self-Service routes
    Route::get('/self/profile', [SelfServiceController::class, 'profile'])->name('self.profile');
    Route::post('/self/profile', [SelfServiceController::class, 'updateProfile'])->name('self.profile.update');
    Route::get('/self/competency', [SelfServiceController::class, 'competency'])->name('self.competency');
    Route::get('/self/trainings', [SelfServiceController::class, 'trainings'])->name('self.trainings');
    Route::post('/self/trainings', [SelfServiceController::class, 'requestTraining'])->name('self.trainings.request');
    Route::get('/self/work-progress', [SelfServiceController::class, 'workProgress'])->name('self.work_progress');
    Route::get('/self/awards', [SelfServiceController::class, 'awards'])->name('self.awards');
    Route::delete('/employees/{id}', [EmployeeController::class, 'destroy'])->name('employees.destroy');
});