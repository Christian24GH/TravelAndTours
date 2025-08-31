<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LearningController extends Controller
{
    /**
     * Return a mock list of learning assignments and recommendations.
     */
    public function index(): JsonResponse
    {
        $items = [
            [
                'employee_id' => 1,
                'employee_name' => 'Jane Doe',
                'department' => 'Engineering',
                'course' => 'Advanced Electrical Safety',
                'status' => 'To Do',
                'due_at' => Carbon::now()->addDays(14)->toDateString(),
                'ai_insight' => 'Recommended based on low Safety score',
                'progress_pct' => 0,
            ],
            [
                'employee_id' => 2,
                'employee_name' => 'John Smith',
                'department' => 'Operations',
                'course' => 'Leadership Fundamentals',
                'status' => 'Overdue',
                'due_at' => Carbon::now()->addDays(21)->toDateString(),
                'ai_insight' => 'Improve leadership for team lead readiness',
                'progress_pct' => 40,
            ],
            [
                'employee_id' => 3,
                'employee_name' => 'Amara Lee',
                'department' => 'Quality',
                'course' => 'Statistical Process Control',
                'status' => 'Completed',
                'due_at' => Carbon::now()->subDays(5)->toDateString(),
                'ai_insight' => 'Maintain technical excellence; suggest mentoring others',
                'progress_pct' => 100,
            ],
        ];

        return response()->json($items);
    }

    public function courses(Request $request)
    {
        $employeeId = $request->query('employee_id');
        // Fetch courses for the employee. Replace with your actual logic:
        $courses = Course::where('employee_id', $employeeId)->get();
        return response()->json($courses);
    }
}


