<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class TrainingController extends Controller
{
    /**
     * Return trainings based on employee's current status with the system
     */
    public function index(Request $request): JsonResponse
    {
        $employeeId = $request->get('employee_id') ?: Auth::id();
        
        // Mock data - replace with your database queries
        $allTrainings = [
            [
                'id' => 1,
                'title' => 'Workplace Safety Training',
                'description' => 'Essential safety protocols and procedures for all employees',
                'duration' => '4 hours',
                'type' => 'Online',
                'status' => 'available',
                'progress' => 0,
                'due_date' => null,
                'completion_date' => null,
                'score' => null,
                'created_at' => '2025-01-01',
            ],
            [
                'id' => 2,
                'title' => 'Customer Service Excellence',
                'description' => 'Advanced customer service techniques and best practices',
                'duration' => '6 hours',
                'type' => 'In-person',
                'status' => 'available',
                'progress' => 0,
                'due_date' => null,
                'completion_date' => null,
                'score' => null,
                'created_at' => '2025-01-15',
            ],
            [
                'id' => 3,
                'title' => 'Data Privacy & Security',
                'description' => 'Understanding GDPR compliance and data protection measures',
                'duration' => '3 hours',
                'type' => 'Online',
                'status' => 'applied',
                'progress' => 65,
                'due_date' => '2025-09-15',
                'completion_date' => null,
                'score' => null,
                'created_at' => '2025-02-01',
            ],
            [
                'id' => 4,
                'title' => 'Leadership Fundamentals',
                'description' => 'Core leadership skills for emerging managers',
                'duration' => '8 hours',
                'type' => 'Hybrid',
                'status' => 'applied',
                'progress' => 25,
                'due_date' => '2025-10-01',
                'completion_date' => null,
                'score' => null,
                'created_at' => '2025-02-15',
            ],
            [
                'id' => 5,
                'title' => 'First Aid Certification',
                'description' => 'Basic first aid and emergency response training',
                'duration' => '1 day',
                'type' => 'In-person',
                'status' => 'completed',
                'progress' => 100,
                'due_date' => '2025-08-01',
                'completion_date' => '2025-07-28',
                'score' => 92,
                'created_at' => '2025-03-01',
            ],
            [
                'id' => 6,
                'title' => 'Project Management Basics',
                'description' => 'Introduction to project management methodologies',
                'duration' => '5 hours',
                'type' => 'Online',
                'status' => 'completed',
                'progress' => 100,
                'due_date' => '2025-07-15',
                'completion_date' => '2025-07-10',
                'score' => 88,
                'created_at' => '2025-03-15',
            ],
        ];

        return response()->json($allTrainings);
    }

    /**
     * Apply for a training course
     */
    public function apply(Request $request): JsonResponse
    {
        $request->validate([
            'training_id' => 'required|integer',
        ]);

        $trainingId = $request->training_id;
        $employeeId = Auth::id();
        
        return response()->json([
            'success' => true,
            'message' => 'Successfully applied for training',
            'training_id' => $trainingId,
            'employee_id' => $employeeId,
            'status' => 'applied',
            'due_date' => Carbon::now()->addDays(30)->toDateString(),
        ]);
    }

    /**
     * Create a new training course (HR2 Admin only)
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user || !in_array($user->role, ['HR2 Admin', 'hr2_admin']) && $user->user_type !== 'HR2 Admin') {
            return response()->json(['error' => 'Unauthorized. HR2 Admin access required.'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'duration' => 'required|string|max:100',
            'type' => 'required|in:Online,In-person,Hybrid,Self-paced',
        ]);
        $newTraining = [
            'id' => rand(1000, 9999),
            'title' => $request->title,
            'description' => $request->description,
            'duration' => $request->duration,
            'type' => $request->type,
            'status' => 'available',
            'progress' => 0,
            'due_date' => null,
            'completion_date' => null,
            'score' => null,
            'created_at' => Carbon::now()->toDateString(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Training course created successfully',
            'training' => $newTraining,
        ], 201);
    }

    /**
     * Test endpoint to verify API connectivity
     */
    public function test(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Training API is working',
            'timestamp' => Carbon::now()->toDateTimeString(),
            'user' => Auth::user() ? Auth::user()->name : 'Not authenticated',
        ]);
    }
}


