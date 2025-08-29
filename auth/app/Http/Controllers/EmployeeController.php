<?php

namespace App\Http\Controllers;
    use App\Models\Employee;
    use App\Models\User;
    use Illuminate\Http\JsonResponse;
    use Illuminate\Http\Request;
    use Illuminate\Validation\ValidationException;
    use Exception;
    use Illuminate\Support\Facades\DB;

    class EmployeeController extends Controller
    {
        /**
         * Upload and update the employee's profile photo.
         * @param Request $request
         * @param int $id
         * @return JsonResponse
         */
        public function uploadPhoto(Request $request, int $id): JsonResponse
        {
            try {
                $employee = Employee::find($id);
                if (!$employee) {
                    return response()->json(['error' => 'Employee not found'], 404);
                }

                $request->validate([
                    'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
                ]);

                $file = $request->file('photo');
                $filename = 'profile_' . $employee->id . '_' . time() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('public/profile_photos', $filename);
                $url = url('storage/profile_photos/' . $filename);

                $employee->profile_photo_url = $url;
                $employee->save();

                return response()->json(['profile_photo_url' => $url, 'employee' => $employee]);
            } catch (ValidationException $e) {
                return response()->json([
                    'message' => 'Validation Failed',
                    'errors' => $e->errors()
                ], 422);
            } catch (Exception $e) {
                return response()->json([
                    'message' => 'Failed to upload photo.',
                    'error' => $e->getMessage()
                ], 500);
            }
        }
    /**
     * Return a list of all employees from the database.
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $employees = Employee::all();
            return response()->json($employees);
        } catch (Exception $e) {
            // Log the error for debugging purposes
            // \Log::error('Failed to retrieve employee list: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to retrieve employee list.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Return a single employee profile by ID.
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $employee = Employee::find($id);

            if (!$employee) {
                return response()->json(['error' => 'Employee not found'], 404);
            }

            return response()->json($employee);
        } catch (Exception $e) {
            // Log the error for debugging purposes
            // \Log::error('Failed to retrieve employee profile: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to retrieve employee profile.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified employee and associated user from the database.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(int $id)
    {
        // Use a database transaction to ensure both deletions are successful, or neither is.
        \DB::transaction(function () use ($id) {

            // Find the employee by their ID
            $employee = Employee::find($id);

            if (!$employee) {
                // Return early if no employee is found
                return;
            }

            // Find the user associated with the employee's email
            $user = User::where('email', $employee->email)->first();

            // If a user exists, delete it first
            if ($user) {
                $user->delete();
            }

            // Then delete the employee record
            $employee->delete();
        });

        return response()->json(['message' => 'Employee and associated user deleted successfully'], 200);
    }

    /**
     * Add a new employee to the database.
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // New validation rules for the simplified form
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
                'role' => 'nullable|string',
            ]);

            // Split the full name into first and last
            $nameParts = explode(' ', $validatedData['name'], 2);
            $firstName = $nameParts[0];
            $lastName = count($nameParts) > 1 ? $nameParts[1] : '';

            \DB::beginTransaction();

            // 1. Create the User account
            $user = User::create([
                'email' => $validatedData['email'],
                'password' => bcrypt($validatedData['password']),
                'name' => $validatedData['name'],
                'role' => $request->input('role', 'Employee'),
            ]);

            // 2. Create the Employee profile linked to the new user with default/placeholder values
            $employee = Employee::create([
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $validatedData['email'],
                'user_id' => $user->id,
                'department' => 'Not Assigned',
                'position' => 'Not Assigned',
                'hire_date' => now(), // Set a default hire date
            ]);

            \DB::commit();

            return response()->json([
                'message' => 'Employee account created successfully.',
                'user' => $user,
                'employee' => $employee,
            ], 201);

        } catch (ValidationException $e) {
            \DB::rollBack();
            return response()->json(['message' => 'Validation Failed', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            \DB::rollBack();
            return response()->json(['message' => 'Failed to add employee.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update an existing employee profile in the database.
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $employee = Employee::find($id);

            if (!$employee) {
                return response()->json(['error' => 'Employee not found'], 404);
            }

            // The 'sometimes' rule ensures validation runs only if the field is present.
            $validatedData = $request->validate([
                'first_name' => 'sometimes|nullable|string|max:255',
                'middle_name' => 'sometimes|nullable|string|max:255',
                'last_name' => 'sometimes|nullable|string|max:255',
                'suffix' => 'sometimes|nullable|string|max:255',
                'department' => 'sometimes|nullable|string|max:255',
                'position' => 'sometimes|nullable|string|max:255',
                'email' => 'sometimes|nullable|email|unique:employees,email,' . $employee->id,
                'phone' => 'sometimes|nullable|string|max:255',
                'address' => 'sometimes|nullable|string|max:255',
                'birthday' => 'sometimes|nullable|date',
                'civil_status' => 'sometimes|nullable|string|max:255',
                'emergency_contact' => 'sometimes|nullable|string|max:255',
                'hire_date' => 'sometimes|nullable|date',
                'manager' => 'sometimes|nullable|string|max:255',
                'employee_status' => 'sometimes|nullable|string|max:255',
            ]);

            $employee->update($validatedData);

            return response()->json($employee);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Failed',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to update employee.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}