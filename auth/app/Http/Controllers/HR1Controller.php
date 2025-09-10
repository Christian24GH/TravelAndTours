<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Applicant;
use App\Models\Interview;
use App\Models\JobPosting;

class HR1Controller extends Controller
{
    // -------------------- Applicants --------------------
    public function applicants() {
        return Applicant::all();
    }

    public function storeApplicant(Request $request) {
        $validated = $request->validate([
            'employee_code' => 'required|string|unique:applicants',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:applicants',
            'phone' => 'required|string|max:20',
            'status' => 'required|string',
            'hire_date' => 'nullable|date',
            'job' => 'nullable|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'employment_type' => 'nullable|string|max:50',
            'department' => 'nullable|string|max:100',
            'salary' => 'nullable|integer',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_address' => 'nullable|string|max:255',
        ]);

        return response()->json(Applicant::create($validated), 201);
    }

    public function deleteApplicant($id) {
        $applicant = Applicant::find($id);
        if (!$applicant) {
            return response()->json(['message' => 'Applicant not found'], 404);
        }
        $applicant->delete();
        return response()->json(['message' => 'Applicant deleted']);
    }

    // -------------------- Interviews --------------------
    public function interviews(Request $request) {
        $q = $request->input('q');
        $query = Interview::query();
        if ($q) {
            $query->where('applicant', 'like', "%$q%")
                  ->orWhere('status', 'like', "%$q%");
        }
        return $query->orderBy('date', 'asc')->get();
    }

    public function storeInterview(Request $request) {
        $validated = $request->validate([
            'applicant' => 'required|string|max:255',
            'date' => 'required|date',
            'status' => 'required|string',
        ]);
        return Interview::create($validated);
    }

    public function updateInterview(Request $request, $id) {
        $interview = Interview::findOrFail($id);
        $interview->update($request->all());
        return $interview;
    }

    public function deleteInterview($id) {
        Interview::destroy($id);
        return response()->json(['message' => 'Interview deleted']);
    }

    // -------------------- Job Postings (Offer Management) --------------------
    public function jobs() {
        return JobPosting::all();
    }

    public function storeJob(Request $request) {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'status' => 'required|string|in:open,closed',
        ]);

        return response()->json(JobPosting::create($validated), 201);
    }

    public function updateJob(Request $request, $id) {
        $job = JobPosting::findOrFail($id);
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'status' => 'sometimes|required|string|in:open,closed',
        ]);

        $job->update($validated);
        return response()->json($job);
    }

    public function deleteJob($id) {
        $job = JobPosting::find($id);
        if (!$job) {
            return response()->json(['message' => 'Job not found'], 404);
        }
        $job->delete();
        return response()->json(['message' => 'Job deleted']);
    }
}
