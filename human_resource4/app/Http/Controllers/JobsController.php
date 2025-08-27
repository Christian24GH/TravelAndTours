<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class JobsController extends Controller
{
    // Get all job positions
    public function index()
    {
        $positions = DB::table('jobs')->get();
        return response()->json($positions);
    }

    // Store new job position
    public function store(Request $request)
    {
        $id = DB::table('jobs')->insertGetId([
            'title' => $request->title,
            'department' => $request->department,
            'description' => $request->description,
            'base_salary' => $request->base_salary,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['id' => $id, 'message' => 'Job Position created successfully']);
    }

    // Show one position
    public function search(Request $request)
    {
        $validated = $request->validate(['q' => 'required|string']);
        $q = $validated['q'];

        return DB::table('jobs')
            ->where('title', 'like', "%{$q}%")
            ->orWhere('department', 'like', "%{$q}%")
            ->get();
    }

    // Update a position
    public function update(Request $request, $id)
    {
        DB::table('jobs')->where('id', $id)->update([
            'title' => $request->title,
            'department' => $request->department,
            'description' => $request->description,
            'base_salary' => $request->base_salary,
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Job Position updated successfully']);
    }

    // Delete a position
    public function destroy($id)
    {
        DB::table('jobs')->where('id', $id)->delete();
        return response()->json(['message' => 'Job Position deleted successfully']);
    }
}
