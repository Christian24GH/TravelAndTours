<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VehicleInsurance extends Controller
{
    public function index(Request $request)
    {
        $records = DB::table('vehicle_insurance')
            ->join('vehicles', 'vehicles.id', '=', 'vehicle_insurance.vehicle_id')
            ->select('vehicle_insurance.*', 'vehicles.plate_number', 'vehicles.vin')
            ->paginate(15);

        return response()->json(['data' => $records]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_id'       => ['required', 'exists:vehicles,id'],
            'provider'         => ['required', 'string'],
            'policy_number'    => ['required', 'string', 'unique:vehicle_insurance,policy_number'],
            'coverage_details' => ['nullable', 'string'],
            'start_date'       => ['required', 'date'],
            'end_date'         => ['required', 'date', 'after:start_date'],
            'status'           => ['required', 'in:active,expired,cancelled'],
        ]);

        DB::table('vehicle_insurance')->insert([
            'uuid'             => Str::uuid(),
            'vehicle_id'       => $validated['vehicle_id'],
            'provider'         => $validated['provider'],
            'policy_number'    => $validated['policy_number'],
            'coverage_details' => $validated['coverage_details'] ?? null,
            'start_date'       => $validated['start_date'],
            'end_date'         => $validated['end_date'],
            'status'           => $validated['status'],
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);

        return response()->json(['message' => 'Insurance record added successfully']);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'provider'         => ['required', 'string'],
            'policy_number'    => ['required', 'string'],
            'coverage_details' => ['nullable', 'string'],
            'start_date'       => ['required', 'date'],
            'end_date'         => ['required', 'date', 'after:start_date'],
            'status'           => ['required', 'in:active,expired,cancelled'],
        ]);

        $record = DB::table('vehicle_insurance')->where('id', $id)->first();
        if (!$record) {
            return response()->json(['message' => 'Record not found'], 404);
        }

        DB::table('vehicle_insurance')
            ->where('id', $id)
            ->update([
                'provider'         => $validated['provider'],
                'policy_number'    => $validated['policy_number'],
                'coverage_details' => $validated['coverage_details'] ?? null,
                'start_date'       => $validated['start_date'],
                'end_date'         => $validated['end_date'],
                'status'           => $validated['status'],
                'updated_at'       => now(),
            ]);

        return response()->json(['message' => 'Insurance record updated successfully']);
    }
}
