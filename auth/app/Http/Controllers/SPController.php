<?php

namespace App\Http\Controllers;

use App\Models\SuccessionPlanning;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SPController extends Controller
{
    public function index(): JsonResponse
    {
        $plans = SuccessionPlanning::all();
        return response()->json($plans);
    }
    public function candidates(): JsonResponse
    {
        $candidates = SuccessionPlanning::all();
        return response()->json($candidates);
    }
}
