<?php

namespace App\Http\Controllers;

use Carbon\Carbon;

use Illuminate\Http\JsonResponse;

class SuccessionController extends Controller
{
    /**
     * Return a mock list of roles with successors and readiness.
     */
    public function index(): JsonResponse
    {
        $plans = [
            [
                'role' => 'Operations Supervisor',
                'primary_successor' => 'John Smith',
                'secondary_successor' => 'Amara Lee',
                'readiness' => '6-12 months',
                'gaps' => ['Leadership', 'Safety compliance'],
            ],
            [
                'role' => 'Quality Lead',
                'primary_successor' => 'Jane Doe',
                'secondary_successor' => 'Carlos Santos',
                'readiness' => '0-3 months',
                'gaps' => ['Advanced statistical methods'],
            ],
        ];

        return response()->json($plans);
    }
    public function candidates()
    {
        return response()->json([
            [
                'fullname' => 'John Smith',
                'current_Position' => 'Operations Supervisor',
                'years_in_company' => 5,
                'readiness_Level' => 'Ready',
            ],
            [
                'fullname' => 'Jane Doe',
                'current_Position' => 'Quality Lead',
                'years_in_company' => 3,
                'readiness_Level' => '6-12 months',
            ],
        ]);
    }
}


