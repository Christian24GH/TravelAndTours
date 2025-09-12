<?php

namespace App\Http\Controllers;

use App\Models\EmployeeSelfService;
use App\Models\User;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ESSController extends Controller
{
    // Employee CRUD
    public function listEmployees(): JsonResponse
    {
        $employees = EmployeeSelfService::all();
        return response()->json($employees);
    }
    public function showEmployee($id): JsonResponse
    {
        $employee = EmployeeSelfService::find($id);
        if (!$employee) {
            return response()->json(['error' => 'Employee not found'], 404);
        }
        return response()->json($employee);
    }
    public function createEmployee(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:employee_self_service,email',
            'department' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'hire_date' => 'nullable|date',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'birthday' => 'nullable|date',
            'civil_status' => 'nullable|string|max:255',
            'emergency_contact' => 'nullable|string|max:255',
            'manager' => 'nullable|string|max:255',
            'employee_status' => 'nullable|string|max:255',
            'profile_photo_url' => 'nullable|url',
            'roles' => 'nullable|string|max:255',
        ]);
        $employee = EmployeeSelfService::create($validatedData);
        return response()->json(['message' => 'Employee created successfully.', 'employee' => $employee], 201);
    }
    public function updateEmployee(Request $request, $id): JsonResponse
    {
        $employee = EmployeeSelfService::find($id);
        if (!$employee) {
            return response()->json(['error' => 'Employee not found'], 404);
        }
        $validatedData = $request->validate([
            'first_name' => 'sometimes|nullable|string|max:255',
            'middle_name' => 'sometimes|nullable|string|max:255',
            'last_name' => 'sometimes|nullable|string|max:255',
            'suffix' => 'sometimes|nullable|string|max:255',
            'department' => 'sometimes|nullable|string|max:255',
            'position' => 'sometimes|nullable|string|max:255',
            'email' => 'sometimes|nullable|email|unique:employee_self_service,email,' . $employee->id,
            'phone' => 'sometimes|nullable|string|max:255',
            'address' => 'sometimes|nullable|string|max:255',
            'birthday' => 'sometimes|nullable|date',
            'civil_status' => 'sometimes|nullable|string|max:255',
            'emergency_contact' => 'sometimes|nullable|string|max:255',
            'hire_date' => 'sometimes|nullable|date',
            'manager' => 'sometimes|nullable|string|max:255',
            'employee_status' => 'sometimes|nullable|string|max:255',
            'profile_photo_url' => 'sometimes|nullable|url',
            'roles' => 'sometimes|nullable|string|max:255',
        ]);
        $employee->update($validatedData);
        // If the role is being updated, also update the user's role in the users table
        if (isset($validatedData['roles']) && !empty($employee->email)) {
            $user = User::where('email', $employee->email)->first();
            if ($user) {
                $user->role = $validatedData['roles'];
                $user->save();
            }
        }
        $employee->refresh();
        return response()->json($employee);
    }
    public function deleteEmployee($id): JsonResponse
    {
        $employee = EmployeeSelfService::find($id);
        if (!$employee) {
            return response()->json(['error' => 'Employee not found'], 404);
        }
        $employee->delete();
        return response()->json(['message' => 'Employee deleted successfully'], 200);
    }

    // Leave Request CRUD
    public function index() {
        // HR Admin: get all, Employee: get own
        $user = auth()->user();
        if ($user->role === 'HR2 Admin') {
            return LeaveRequest::with('employee')->get();
        }
        return LeaveRequest::with('employee')->where('employee_id', $user->id)->get();
    }

    public function store(Request $request) {
        $data = $request->validate([
            'type' => 'required|string',
            'start' => 'required|date',
            'end' => 'required|date|after_or_equal:start',
            'reason' => 'required|string',
        ]);
        $data['employee_id'] = auth()->id();
        $leave = LeaveRequest::create($data);
        return response()->json($leave, 201);
    }

    public function update(Request $request, LeaveRequest $leaveRequest) {
        $request->validate(['status' => 'required|in:Accepted,Denied']);
        $leaveRequest->status = $request->status;
        $leaveRequest->save();
        return response()->json($leaveRequest);
    }
}
