<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Events\EmployeeUpdates;
use Exception;

class EmployeesController extends Controller
{
    /**
     * Get paginated employees (with optional search).
     */
    public function show(Request $request)
    {
        $query = DB::table('employees')
            ->select(
                'id',
                'employee_code',
                'first_name',
                'last_name',
                'email',
                'phone',
                'date_of_birth',
                'hire_date',
                'job_id',
                'salary',
                'employment_type',
                'status',
                'address',
                'emergency_contact',
                'emergency_phone',
                'created_at',
                'updated_at'
            );

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('first_name', 'like', "%{$q}%")
                    ->orWhere('last_name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('employee_code', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%")
                    ->orWhere('status', 'like', "%{$q}%");
            });
        }

        return $query->paginate(10);
    }

    /**
     * Get all employees without pagination.
     */
    public function showAll()
    {
        return DB::table('employees')
            ->select(
                'id',
                'employee_code',
                'first_name',
                'last_name',
                'email',
                'phone',
                'date_of_birth',
                'hire_date',
                'job_id',
                'salary',
                'employment_type',
                'status',
                'address',
                'emergency_contact',
                'emergency_phone',
                'created_at',
                'updated_at'
            )
            ->get();
    }

    /**
     * Search employees quickly.
     */
    public function search(Request $request)
    {
        $validated = $request->validate(['q' => 'required|string']);
        $q = $validated['q'];

        return DB::table('employees')
            ->where('first_name', 'like', "%{$q}%")
            ->orWhere('last_name', 'like', "%{$q}%")
            ->orWhere('email', 'like', "%{$q}%")
            ->orWhere('employee_code', 'like', "%{$q}%")
            ->orWhere('phone', 'like', "%{$q}%")
            ->orWhere('status', 'like', "%{$q}%")
            ->get();
    }

    /**
     * Register new employee.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'employee_code'     => 'required|string|unique:employees,employee_code|max:50',
            'first_name'        => 'required|string|max:100',
            'last_name'         => 'required|string|max:100',
            'email'             => 'required|email|unique:employees,email',
            'phone'             => 'nullable|string|max:20',
            'date_of_birth'     => 'required|date',
            'hire_date'         => 'required|date',
            'job_id'            => 'required|exists:jobs,id',
            'salary'            => 'required|numeric|min:0',
            'employment_type'   => 'required|in:full_time,contract,intern',
            'status'            => 'required|in:active,inactive,terminated',
            'address'           => 'nullable|string',
            'emergency_contact' => 'nullable|string|max:100',
            'emergency_phone'   => 'nullable|string|max:20',
        ]);

        $validated['phone'] = $validated['phone'] ?? null;
        $validated['address'] = $validated['address'] ?? null;
        $validated['emergency_contact'] = $validated['emergency_contact'] ?? null;
        $validated['emergency_phone'] = $validated['emergency_phone'] ?? null;

        try {
            $id = DB::table('employees')->insertGetId($validated);
            $employee = DB::table('employees')->find($id);

            return response()->json([
                'message' => 'Employee Registered Successfully',
                'employee' => $employee,
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error registering employee',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update employee.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'employee_code'     => 'required|string|max:50|unique:employees,employee_code,' . $id,
            'first_name'        => 'required|string|max:100',
            'last_name'         => 'required|string|max:100',
            'email'             => 'required|email|unique:employees,email,' . $id,
            'phone'             => 'nullable|string|max:20',
            'date_of_birth'     => 'required|date',
            'hire_date'         => 'required|date',
            'job_id'            => 'required|exists:jobs,id',
            'salary'            => 'required|numeric|min:0',
            'employment_type'   => 'required|in:full_time,contract,intern',
            'status'            => 'required|in:active,inactive,terminated',
            'address'           => 'nullable|string',
            'emergency_contact' => 'nullable|string|max:100',
            'emergency_phone'   => 'nullable|string|max:20',
        ]);

        try {
            DB::transaction(function () use ($validated, $id) {
                DB::table('employees')
                    ->where('id', $id)
                    ->update($validated);
            });

            $employee = DB::table('employees')->find($id);

            broadcast(new EmployeeUpdates($employee))->toOthers();

            return response()->json([
                'message' => 'Employee Updated Successfully',
                'employee' => $employee,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error updating employee',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
