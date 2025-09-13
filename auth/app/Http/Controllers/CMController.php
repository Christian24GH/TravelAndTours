<?php

namespace App\Http\Controllers;

use App\Models\CompetencyManagement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CMController extends Controller
{
    public function index(): JsonResponse
    {
        $competencies = CompetencyManagement::all();
        return response()->json($competencies);
    }
    public function store(Request $request): JsonResponse
    {
        $validator = \Validator::make($request->all(), [
            'employee_id' => 'required|integer',
            'role_id' => 'nullable|integer',
            'role_name' => 'nullable|string|max:255',
            'competency_id' => 'nullable|integer',
            'competency_name' => 'nullable|string|max:255',
            'competency_type' => 'nullable|string|max:255',
            'competency_level' => 'nullable|string|max:255',
            'last_assessed_date' => 'nullable|date',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $competency = CompetencyManagement::create($validator->validated());
        return response()->json(['message' => 'Competency data saved successfully!', 'competency' => $competency], 201);
    }
}
