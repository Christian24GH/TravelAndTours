<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class VehicleCompliance extends Controller
{
    public function index(Request $request)
    {
        $records = DB::table('vehicle_compliance')
            ->join('vehicles', 'vehicles.id', '=', 'vehicle_compliance.vehicle_id')
            ->select('vehicle_compliance.*', 'vehicles.plate_number', 'vehicles.vin')
            ->paginate(15);

        return response()->json(['data' => $records]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_id'      => ['required', 'exists:vehicles,id'],
            'document_type'   => ['required', Rule::in(['registration', 'insurance', 'inspection'])],
            'document_number' => ['nullable', 'string'],
            'provider'        => ['nullable', 'string'],
            'issue_date'      => ['nullable', 'date'],
            'expiry_date'     => ['nullable', 'date'],
            'document_file'   => ['nullable', 'file', 'max:4096'], // 4MB
        ]);

        $filePath = null;
        if ($request->hasFile('document_file')) {
            $filePath = $request->file('document_file')->store('vehicle_compliance', 'public');
        }

        DB::table('vehicle_compliance')->insert([
            'vehicle_id'      => $validated['vehicle_id'],
            'document_type'   => $validated['document_type'],
            'document_number' => $validated['document_number'] ?? null,
            'provider'        => $validated['provider'] ?? null,
            'issue_date'      => $validated['issue_date'] ?? null,
            'expiry_date'     => $validated['expiry_date'] ?? null,
            'document_file'   => $filePath,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        return response()->json(['message' => 'Compliance document added successfully']);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'document_type'   => ['required', Rule::in(['registration', 'insurance', 'inspection'])],
            'document_number' => ['nullable', 'string'],
            'provider'        => ['nullable', 'string'],
            'issue_date'      => ['nullable', 'date'],
            'expiry_date'     => ['nullable', 'date'],
            'document_file'   => ['nullable', 'file', 'max:4096'],
        ]);

        $record = DB::table('vehicle_compliance')->where('id', $id)->first();
        if (!$record) {
            return response()->json(['message' => 'Record not found'], 404);
        }

        $filePath = $record->document_file;
        if ($request->hasFile('document_file')) {
            if ($filePath) {
                Storage::disk('public')->delete($filePath);
            }
            $filePath = $request->file('document_file')->store('vehicle_compliance', 'public');
        }

        DB::table('vehicle_compliance')
            ->where('id', $id)
            ->update([
                'document_type'   => $validated['document_type'],
                'document_number' => $validated['document_number'] ?? null,
                'provider'        => $validated['provider'] ?? null,
                'issue_date'      => $validated['issue_date'] ?? null,
                'expiry_date'     => $validated['expiry_date'] ?? null,
                'document_file'   => $filePath,
                'updated_at'      => now(),
            ]);

        return response()->json(['message' => 'Record updated successfully']);
    }
}
