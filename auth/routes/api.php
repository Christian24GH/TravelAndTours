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
use App\Http\Controllers\WorkProgressController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/csrf-token', function (Request $request) {
        return response()->json(['csrfToken' => csrf_token()]);
    });
    Route::get('/user', [AuthController::class, 'user'])->name('user');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // ----HR2 API----
    Route::get('/competency', [CompetencyController::class, 'index'])->name('competency.index');
    Route::get('/learning', [LearningController::class, 'index'])->name('learning.index');
    Route::get('/learning/courses', [LearningController::class, 'courses']);
    Route::get('/training', [TrainingController::class, 'index'])->name('training.index');
    Route::get('/succession', [SuccessionController::class, 'index'])->name('succession.index');
    Route::get('/succession-candidates', [SuccessionController::class, 'candidates']);
    Route::get('/trainings/available', [TrainingController::class, 'available']);
    Route::get('/trainings/done', [TrainingController::class, 'done']);
    // Self-service (for logged-in employee)
    Route::get('/self/profile', [SelfServiceController::class, 'profile'])->name('self.profile');
    Route::post('/self/profile', [SelfServiceController::class, 'updateProfile'])->name('self.profile.update');
    Route::get('/self/competency', [SelfServiceController::class, 'competency'])->name('self.competency');
    Route::get('/self/trainings', [SelfServiceController::class, 'trainings'])->name('self.trainings');
    Route::post('/self/trainings', [SelfServiceController::class, 'requestTraining'])->name('self.trainings.request');
    Route::get('/self/work-progress', [SelfServiceController::class, 'workProgress'])->name('self.work_progress');
    Route::get('/self/awards', [SelfServiceController::class, 'awards'])->name('self.awards');
    // CRUD admin UI
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::get('/employees/{id}', [EmployeeController::class, 'show'])->name('employees.show');
    Route::patch('/employees/{id}', [EmployeeController::class, 'update'])->name('employees.update');
    Route::delete('/employees/{id}', [EmployeeController::class, 'destroy'])->name('employees.destroy');
    Route::get('/work-progress', [WorkProgressController::class, 'index']);
});