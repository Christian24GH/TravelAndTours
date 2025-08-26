<?php

namespace App\Http\Controllers;

use Carbon\Carbon;

use Illuminate\Http\JsonResponse;

class TrainingController extends Controller
{
    /**
     * Return a mock list of available trainings and employee enrollments.
     */
    public function index(): JsonResponse
    {
        $trainings = [
            ['id' => 101, 'title' => 'Forklift Safety', 'type' => 'Safety', 'provider' => 'OSHA', 'duration_hours' => 4],
            ['id' => 102, 'title' => 'Lean Basics', 'type' => 'Operations', 'provider' => 'Internal', 'duration_hours' => 6],
            ['id' => 103, 'title' => 'Advanced Troubleshooting', 'type' => 'Technical', 'provider' => 'Vendor', 'duration_hours' => 8],
        ];

        $enrollments = [
            ['employee_id' => 1, 'employee_name' => 'Jane Doe', 'training_id' => 101, 'status' => 'Assigned', 'due_at' => Carbon::now()->addDays(10)->toDateString()],
            ['employee_id' => 2, 'employee_name' => 'John Smith', 'training_id' => 103, 'status' => 'In Progress', 'due_at' => Carbon::now()->addDays(5)->toDateString()],
        ];

        return response()->json(['trainings' => $trainings, 'enrollments' => $enrollments]);
    }
}


