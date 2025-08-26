<?php

namespace App\Http\Controllers;

use Carbon\Carbon;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class SelfServiceController extends Controller
{
    private function getEmployeesSource(): array
    {
        $employeeApiUrl = config('services.employee_api.url') ?: url('/api/employees');
        try {
            $apiResponse = Http::get($employeeApiUrl);
            if ($apiResponse->successful()) {
                $data = $apiResponse->json();
                if (is_array($data) && isset($data['data']) && is_array($data['data'])) {
                    return $data['data'];
                }
                return is_array($data) ? $data : [];
            }
        } catch (\Throwable $e) {
            // ignore and fallback
        }
        return [];
    }

    public function profile(Request $request)
    {
        $employeeId = (int) ($request->query('employee_id', 1));
        $employees = $this->getEmployeesSource();
        $found = collect($employees)->firstWhere('id', $employeeId);
        if (!$found) {
            // minimal fallback
            $found = [
                'id' => $employeeId,
                'first_name' => 'Employee',
                'last_name' => '#'.$employeeId,
                'department' => 'Unassigned',
                'email' => 'employee'.$employeeId.'@example.com',
                'phone' => '',
            ];
        }
        $found['employee_name'] = trim(($found['first_name'] ?? '').' '.($found['last_name'] ?? ''));
        $found['email'] = $found['email'] ?? ('employee'.$employeeId.'@example.com');
        $found['phone'] = $found['phone'] ?? '';

        return response()->json($found);
    }

    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|integer|min:1',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'emergency_contact' => 'nullable|string|max:255',
            'profile_photo_url' => 'nullable|url',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payload = $validator->validated();
        // In a real app: persist to DB. Here: echo back.
        return response()->json(['message' => 'Profile updated', 'profile' => $payload]);
    }

    public function competency(Request $request)
    {
        $employeeId = (int) ($request->query('employee_id', 1));
        $employees = $this->getEmployeesSource();
        $employee = collect($employees)->firstWhere('id', $employeeId) ?: [
            'id' => $employeeId,
            'first_name' => 'Employee',
            'last_name' => '#'.$employeeId,
            'department' => 'Unassigned',
        ];

        $employee['employee_name'] = ($employee['first_name'] ?? '').' '.($employee['last_name'] ?? '');
        $seed = $employee['id'] ?? 0;
        srand(crc32($seed));
        $employee['technical_skill'] = 40 + (abs(crc32($seed.'tech')) % 36);
        $employee['safety_skill'] = 40 + (abs(crc32($seed.'safety')) % 36);
        $employee['leadership_skill'] = 40 + (abs(crc32($seed.'leadership')) % 36);
        $employee['overall_score'] = round(($employee['technical_skill'] + $employee['safety_skill'] + $employee['leadership_skill']) / 3);
        if (!isset($employee['department'])) {
            $departments = ['Engineering', 'Operations', 'Quality', 'Safety', 'Logistics'];
            $employee['department'] = $departments[$seed % count($departments)];
        }
        $notes = [];
        if ($employee['overall_score'] >= 70) { $notes[] = 'Ready for higher-responsibility tasks'; }
        if ($employee['technical_skill'] < 50) { $notes[] = 'Prioritize technical training'; }
        if ($employee['safety_skill'] < 50) { $notes[] = 'Schedule safety refresher'; }
        if ($employee['leadership_skill'] < 50) { $notes[] = 'Add leadership coaching/mentorship'; }
        if (empty($notes)) { $notes[] = 'Balanced skillset; maintain workload'; }
        $employee['task_ai_insight'] = implode(' • ', $notes);
        srand();

        return response()->json($employee);
    }

    public function trainings(Request $request)
    {
        $employeeId = (int) ($request->query('employee_id', 1));
        $apiUrl = url('/api/training');
        $payload = ['trainings' => [], 'enrollments' => []];
        try {
            $res = Http::get($apiUrl);
            if ($res->successful()) {
                $payload = $res->json();
            }
        } catch (\Throwable $e) {
            // ignore
        }
        $enrollments = collect($payload['enrollments'] ?? [])->where('employee_id', $employeeId)->values()->all();
        return response()->json(['trainings' => $payload['trainings'] ?? [], 'enrollments' => $enrollments]);
    }

    public function requestTraining(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|integer|min:1',
            'training_id' => 'required|integer|min:1',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $data = $validator->validated();
        // In a real app: create enrollment row and notify.
        return response()->json(['message' => 'Training request submitted', 'request' => $data], 201);
    }

    public function workProgress(Request $request)
    {
        $employeeId = (int) ($request->query('employee_id', 1));
    $today = Carbon::now();
        $rows = [
            [
                'id' => 1,
                'title' => 'Electrical Safety Basics',
                'status' => 'Done',
                'due_date' => $today->copy()->subDays(10)->toDateString(),
                'progress' => 100,
            ],
            [
                'id' => 2,
                'title' => 'Leadership Fundamentals',
                'status' => 'In Progress',
                'due_date' => $today->copy()->addDays(12)->toDateString(),
                'progress' => 60,
            ],
            [
                'id' => 3,
                'title' => 'PPE and Safety Compliance',
                'status' => 'In Progress',
                'due_date' => $today->copy()->addDays(30)->toDateString(),
                'progress' => 30,
            ],
        ];
        return response()->json($rows);
    }

    public function awards(Request $request)
    {
        $employeeId = (int) ($request->query('employee_id', 1));
        $awards = [
            [
                'id' => 1001,
                'title' => 'Safety Awareness Certificate',
                'issued_at' => Carbon::now()->subMonths(2)->toDateString(),
                'file_url' => null,
            ],
        ];
        return response()->json($awards);
    }
}


