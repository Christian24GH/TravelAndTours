<?php

namespace App\Http\Controllers;

use App\Models\Applicant;
use Illuminate\Http\Request;

class ApplicantController extends Controller
{

    public function destroy($id)
{
    $applicant = Applicant::find($id);

    if (!$applicant) {
        return response()->json(['message' => 'Applicant not found'], 404);
    }

    $applicant->delete();

    return response()->json(['message' => 'Applicant deleted successfully']);
}

    public function index()
    {
        return Applicant::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:applicants',
            'phone'    => 'required|string|max:20',
            'position' => 'required|string|max:255',
        ]);

        $applicant = Applicant::create($validated);

        return response()->json($applicant, 201);
    }
}

