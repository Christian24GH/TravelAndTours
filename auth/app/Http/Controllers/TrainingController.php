<?php

namespace App\Http\Controllers;

use Carbon\Carbon;

use Illuminate\Http\JsonResponse;

class TrainingController extends Controller
{
    /**
     * Return a mock list of available trainings for the logged-in user.
     */
    public function available(): JsonResponse
    {
        // In a real app, filter by logged-in user
        $trainings = [
            [
                'id' => 201,
                'title' => 'Workplace Safety',
                'trainer' => 'Jane Trainer',
                'apply_url' => 'https://example.com/apply/201',
            ],
            [
                'id' => 202,
                'title' => 'Customer Service',
                'trainer' => 'John Coach',
                'apply_email' => 'trainings@example.com',
            ],
        ];
        return response()->json($trainings);
    }

    /**
     * Return a mock list of completed trainings for the logged-in user.
     */
    public function done(): JsonResponse
    {
        // In a real app, filter by logged-in user
        $done = [
            [
                'id' => 301,
                'title' => 'Fire Drill',
                'trainer' => 'Safety Officer',
                'completionDATE' => '2025-07-01',
                'file_url' => 'https://example.com/certificates/301.pdf',
            ],
            [
                'id' => 302,
                'title' => 'First Aid',
                'trainer' => 'Red Cross',
                'completionDATE' => '2025-06-15',
                'file_url' => null,
            ],
        ];
        return response()->json($done);
    }
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


