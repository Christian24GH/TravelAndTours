<?php

namespace App\Http\Controllers;

use App\Models\Interview;
use Illuminate\Http\Request;

class InterviewController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->input('q');
        $query = Interview::query();

        if ($q) {
            $query->where('applicant', 'like', "%$q%")
                  ->orWhere('status', 'like', "%$q%");
        }

        return $query->orderBy('date', 'asc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'applicant' => 'required|string|max:255',
            'date' => 'required|date',
            'status' => 'required|string',
        ]);

        return Interview::create($validated);
    }

    public function update(Request $request, $id)
    {
        $interview = Interview::findOrFail($id);
        $interview->update($request->all());
        return $interview;
    }

    public function destroy($id)
    {
        Interview::destroy($id);
        return response()->json(['message' => 'Interview deleted']);
    }
}
