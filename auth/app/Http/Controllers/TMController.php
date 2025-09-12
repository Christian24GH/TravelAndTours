<?php

namespace App\Http\Controllers;

use App\Models\TrainingManagement;
use App\Models\SuccessionPlanning;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class TMController extends Controller
{
    // Training Management endpoints
    public function index(Request $request): JsonResponse
    {
        $employeeId = $request->get('employee_id') ?: Auth::id();
        // Show both global (employee_id is null) and user-specific trainings
        $trainings = TrainingManagement::where(function($query) use ($employeeId) {
            $query->whereNull('employee_id')
                  ->orWhere('employee_id', $employeeId);
        })->get();
        return response()->json($trainings);
    }
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user || (!in_array($user->role, ['HR2 Admin', 'hr2_admin']) && $user->user_type !== 'HR2 Admin')) {
            return response()->json(['error' => 'Unauthorized. HR2 Admin access required.'], 403);
        }
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'duration' => 'required|string|max:100',
            'type' => 'required|in:Online,In-person,Hybrid,Self-paced',
        ]);
        $training = TrainingManagement::create([
            'employee_id' => null,
            'program_name' => $request->title,
            'provider' => $request->description,
            'duration' => $request->duration,
            'target_skills' => $request->type,
            'status' => 'available',
        ]);
        return response()->json([
            'success' => true,
            'message' => 'Training course created successfully',
            'training' => $training,
        ], 201);
    }
    public function update(Request $request, $id): JsonResponse
    {
        $user = Auth::user();
        if (!$user || (!in_array($user->role, ['HR2 Admin', 'hr2_admin']) && $user->user_type !== 'HR2 Admin')) {
            return response()->json(['error' => 'Unauthorized. HR2 Admin access required.'], 403);
        }
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'duration' => 'required|string|max:100',
            'type' => 'required|in:Online,In-person,Hybrid,Self-paced',
        ]);
        $training = TrainingManagement::find($id);
        if (!$training) {
            return response()->json(['error' => 'Training not found'], 404);
        }
        $training->update([
            'program_name' => $request->title,
            'provider' => $request->description,
            'duration' => $request->duration,
            'target_skills' => $request->type,
        ]);
        return response()->json([
            'success' => true,
            'message' => 'Training updated successfully',
            'training' => $training,
        ]);
    }
    public function destroy($id): JsonResponse
    {
        $user = Auth::user();
        if (!$user || (!in_array($user->role, ['HR2 Admin', 'hr2_admin']) && $user->user_type !== 'HR2 Admin')) {
            return response()->json(['error' => 'Unauthorized. HR2 Admin access required.'], 403);
        }
        $training = TrainingManagement::find($id);
        if (!$training) {
            return response()->json(['error' => 'Training not found'], 404);
        }
        $training->delete();
        return response()->json(['success' => true, 'message' => 'Training deleted successfully']);
    }
    // Succession Planning endpoints
    public function listSuccessionPlans()
    {
        $plans = SuccessionPlanning::all();
        return response()->json($plans);
    }
    public function listSuccessionCandidates()
    {
        $candidates = SuccessionPlanning::all();
        return response()->json($candidates);
    }
}
