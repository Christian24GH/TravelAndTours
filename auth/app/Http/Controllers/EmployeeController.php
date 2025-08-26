<?php

namespace App\Http\Controllers;

use Carbon\Carbon;

use Illuminate\Http\JsonResponse;

class EmployeeController extends Controller
{
    // Simulated employee data (in-memory for demo)
    private $employees = [
        [
            'id' => 1,
            'first_name' => 'Jane',
            'middle_name' => 'Marie',
            'last_name' => 'Doe',
            'suffix' => '',
            'department' => 'Engineering',
            'position' => 'Software Engineer',
            'email' => 'jane.doe@example.com',
            'phone' => '+1 555-1001',
            'address' => '123 Main St, City',
            'birthday' => '1990-05-10',
            'civil_status' => 'Single',
            'emergency_contact' => 'John Doe (+1 555-2001)',
            'hire_date' => '2022-06-01',
            'manager' => 'Sarah Lee',
            'employee_status' => 'Active',
            'profile_photo_url' => null,
        ],
        [
            'id' => 2,
            'first_name' => 'John',
            'middle_name' => 'Paul',
            'last_name' => 'Smith',
            'suffix' => 'Jr.',
            'department' => 'Operations',
            'position' => 'Fleet Supervisor',
            'email' => 'john.smith@example.com',
            'phone' => '+1 555-1002',
            'address' => '456 Oak Ave, City',
            'birthday' => '1985-11-22',
            'civil_status' => 'Married',
            'emergency_contact' => 'Mary Smith (+1 555-2002)',
            'hire_date' => '2024-01-15',
            'manager' => 'Sarah Lee',
            'employee_status' => 'Active',
            'profile_photo_url' => null,
        ],
        [
            'id' => 3,
            'first_name' => 'Amara',
            'middle_name' => '',
            'last_name' => 'Lee',
            'suffix' => '',
            'department' => 'Quality',
            'position' => 'QA Specialist',
            'email' => 'amara.lee@example.com',
            'phone' => '+1 555-1003',
            'address' => '789 Pine Rd, City',
            'birthday' => '1992-03-18',
            'civil_status' => 'Single',
            'emergency_contact' => 'Ken Lee (+1 555-2003)',
            'hire_date' => '2023-03-10',
            'manager' => 'Carlos Santos',
            'employee_status' => 'On Leave',
            'profile_photo_url' => null,
        ],
        [
            'id' => 4,
            'first_name' => 'Carlos',
            'middle_name' => '',
            'last_name' => 'Santos',
            'suffix' => '',
            'department' => 'Safety',
            'position' => 'Safety Officer',
            'email' => 'carlos.santos@example.com',
            'phone' => '+1 555-1004',
            'address' => '321 Cedar Blvd, City',
            'birthday' => '1988-09-30',
            'civil_status' => 'Married',
            'emergency_contact' => 'Ana Santos (+1 555-2004)',
            'hire_date' => '2025-01-01',
            'manager' => 'Sarah Lee',
            'employee_status' => 'Terminated',
            'profile_photo_url' => null,
        ],
    ];

    /**
     * Return a mock list of employees as JSON for testing.
     */
    public function index(): JsonResponse
    {
        return response()->json($this->employees);
    }

    /**
     * Return a single employee profile by ID.
     */
    public function show($id): JsonResponse
    {
        $emp = collect($this->employees)->firstWhere('id', (int)$id);
        if (!$emp) {
            return response()->json(['error' => 'Employee not found'], 404);
        }
        return response()->json($emp);
    }

    /**
     * Update an employee profile (mock, does not persist).
     */
    public function update($id): JsonResponse
    {
        // In a real app, validate and update DB here
        $data = request()->all();
        $emp = collect($this->employees)->firstWhere('id', (int)$id);
        if (!$emp) {
            return response()->json(['error' => 'Employee not found'], 404);
        }
        // Simulate update (merge fields)
        $updated = array_merge($emp, $data);
        return response()->json($updated);
    }
}


