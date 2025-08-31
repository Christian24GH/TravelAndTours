<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WorkProgressController extends Controller
{
    /**
     * Display a listing of the work progress for an employee.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $employeeId = $request->query('employee_id');
        if (!$employeeId) {
            return response()->json(['error' => 'employee_id is required'], 400);
        }

        // Sample Data
        $progress = [
            [
                'id' => 1,
                'title' => 'Forklift Safety',
                'status' => 'In Progress',
                'due_date' => '2025-09-15',
                'progress' => 60,
            ],
            [
                'id' => 2,
                'title' => 'Customer Service',
                'status' => 'Completed',
                'due_date' => '2025-08-01',
                'progress' => 100,
            ],
        ];
        return response()->json($progress);
    }
}
