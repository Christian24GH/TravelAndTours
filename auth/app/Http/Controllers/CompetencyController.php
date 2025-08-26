<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CompetencyController extends Controller
{
    /**
     * This is your original method, which returns a view.
     * I've kept it here for reference.
     */
    public function competency()
    {
        $employeeApiUrl = config('services.employee_api.url') ?: url('/api/competency');
        $apiResponse = Http::get($employeeApiUrl);

        if ($apiResponse->successful()) {
            $employees = collect($apiResponse->json())->map(function ($employee) {
                // Add the employee name
                $employee['employee_name'] = ($employee['first_name'] ?? '') . ' ' . ($employee['last_name'] ?? '');
                $employeeId = $employee['id'] ?? 0;

                // Set seed based on employee ID for consistent random values
                srand(crc32($employeeId));

                // Generate skill scores between 40-75% for consistency
                $employee['technical_skill'] = 40 + (abs(crc32($employeeId . 'tech')) % 36);
                $employee['safety_skill'] = 40 + (abs(crc32($employeeId . 'safety')) % 36);
                $employee['leadership_skill'] = 40 + (abs(crc32($employeeId . 'leadership')) % 36);

                // Calculate overall score
                $employee['overall_score'] = round(($employee['technical_skill'] + $employee['safety_skill'] + $employee['leadership_skill']) / 3);

                // Reset random seed
                srand();

                return $employee;
            })->toArray();
        } else {
            $employees = [];
        }

        return view('auth.others.competency', compact('employees'));
    }

    /**
     * API method to GET all employee competency data.
     * This method will return a JSON response instead of a view.
     */
    public function index()
    {
        $employeeApiUrl = config('services.employee_api.url');
        $sourceEmployees = [];

        Log::info('CompetencyController: Attempting to fetch data from URL: ' . $employeeApiUrl);

        if ($employeeApiUrl) {
            $apiResponse = Http::get($employeeApiUrl);

            if (!$apiResponse->successful()) {
                Log::error('CompetencyController: API request failed. Using mock data.', [
                    'url' => $employeeApiUrl,
                    'status' => $apiResponse->status(),
                    'response' => $apiResponse->body(),
                ]);
                // Fallback to mock data
                $sourceEmployees = [
                    ['id' => 1, 'first_name' => 'John', 'last_name' => 'Doe', 'department' => 'Engineering'],
                    ['id' => 2, 'first_name' => 'Jane', 'last_name' => 'Smith', 'department' => 'Operations'],
                    ['id' => 3, 'first_name' => 'Peter', 'last_name' => 'Jones', 'department' => 'Quality'],
                    ['id' => 4, 'first_name' => 'Alice', 'last_name' => 'Brown', 'department' => 'Safety'],
                ];
            } else {
                $sourceEmployees = $apiResponse->json();
                Log::info('CompetencyController: API response received.', ['data_sample' => array_slice($sourceEmployees, 0, 5)]);
                if (is_array($sourceEmployees) && isset($sourceEmployees['data']) && is_array($sourceEmployees['data'])) {
                    $sourceEmployees = $sourceEmployees['data'];
                }
            }
        } else {
            Log::warning('CompetencyController: EMPLOYEE_API_URL is not configured. Using mock data.');
            // No external API configured; use mock data
            $sourceEmployees = [
                ['id' => 1, 'first_name' => 'John', 'last_name' => 'Doe', 'department' => 'Engineering'],
                ['id' => 2, 'first_name' => 'Jane', 'last_name' => 'Smith', 'department' => 'Operations'],
                ['id' => 3, 'first_name' => 'Peter', 'last_name' => 'Jones', 'department' => 'Quality'],
                ['id' => 4, 'first_name' => 'Alice', 'last_name' => 'Brown', 'department' => 'Safety'],
            ];
        }

        Log::info('CompetencyController: Source employees before map.', ['source_employees' => array_slice($sourceEmployees, 0, 5)]);
        $employees = collect($sourceEmployees)->map(function ($employee) {
                Log::info('CompetencyController: Processing employee.', ['employee_id' => $employee['id'] ?? 'N/A', 'employee_data' => $employee]);
                // Add the employee name
                $employee['employee_name'] = ($employee['first_name'] ?? '') . ' ' . ($employee['last_name'] ?? '');
                $employeeId = $employee['id'] ?? 0;

                // Set seed based on employee ID for consistent random values
                // Note: The srand() function is not thread-safe. For a real-world API,
                // you would likely use a more robust method or retrieve these scores from a database.
                srand(crc32($employeeId));

                // Generate skill scores between 40-75% for consistency
                $employee['technical_skill'] = 40 + (abs(crc32($employeeId . 'tech')) % 36);
                $employee['safety_skill'] = 40 + (abs(crc32($employeeId . 'safety')) % 36);
                $employee['leadership_skill'] = 40 + (abs(crc32($employeeId . 'leadership')) % 36);

                // Calculate overall score
                $employee['overall_score'] = round(($employee['technical_skill'] + $employee['safety_skill'] + $employee['leadership_skill']) / 3);

                // Ensure department exists (fallback for mock data)
                if (!isset($employee['department'])) {
                    $departments = ['Engineering', 'Operations', 'Quality', 'Safety', 'Logistics'];
                    $employee['department'] = $departments[$employeeId % count($departments)];
                }

                // Build task and AI insight text on backend so UI can display directly
                $notes = [];
                if ($employee['overall_score'] >= 70) { $notes[] = 'Ready for higher-responsibility tasks'; }
                if ($employee['technical_skill'] < 50) { $notes[] = 'Prioritize technical training'; }
                if ($employee['safety_skill'] < 50) { $notes[] = 'Schedule safety refresher'; }
                if ($employee['leadership_skill'] < 50) { $notes[] = 'Add leadership coaching/mentorship'; }
                if (empty($notes)) { $notes[] = 'Balanced skillset; maintain workload'; }
                $employee['task_ai_insight'] = implode(' • ', $notes);

                // Reset random seed
                srand();

                return $employee;
            })->toArray();

        // Return the processed employee data as a JSON response
        return response()->json($employees);
    }

    /**
     * API method to POST new data. This is a placeholder for demonstration.
     * In a real application, you'd save this data to a database.
     */
    public function store(Request $request)
    {
        // Define validation rules for the incoming request data
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'technical_skill' => 'required|integer|between:0,100',
            'safety_skill' => 'required|integer|between:0,100',
            'leadership_skill' => 'required|integer|between:0,100',
        ]);

        // If validation fails, return an error response
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // In a real application, you would save this new employee to the database here.
        // For now, we'll just return a success message and the data we received.
        $employee = $request->all();
        $employee['overall_score'] = round(($employee['technical_skill'] + $employee['safety_skill'] + $employee['leadership_skill']) / 3);
        $employee['message'] = 'Employee competency data received successfully!';

        return response()->json($employee, 201);
    }
}