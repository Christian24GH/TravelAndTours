<?php

namespace App\Http\Controllers;

use App\Events\VehicleUpdates;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class Vehicles extends Controller
{
    // Include all visible columns
    private $rows = [
        'vin', 'plate_number', 'make', 'model', 'year',
        'type', 'capacity', 'seats', 'fuel_efficiency',
        'acquisition_date', 'status'
    ];

    public function show(Request $request)
    {
        $q = $request->input('q');

        $table = DB::table('vehicles');

        if ($request->filled('q')) {
            $table->where(function ($query) use ($q) {
                $query->where('vin', 'like', "%{$q}%")
                    ->orWhere('plate_number', 'like', "%{$q}%")
                    ->orWhere('make', 'like', "%{$q}%")
                    ->orWhere('model', 'like', "%{$q}%")
                    ->orWhere('status', 'like', "%{$q}%");
            });
        }

        $vehicles = $table->paginate(
            15,
            array_merge($this->rows, ['id', 'created_at', 'updated_at'])
        );

        return response()->json(['vehicles' => $vehicles]);
    }

    /** 
     * TODO: Prevent showing available vehicles if already selected in a reservation request
     */
    public function showAll(Request $request)
    {
        $table = DB::table('vehicles');

        if ($request->filled('q')) {
            $q = $request->input('q');

            $table->where(function ($query) use ($q) {
                $query->where('vin', 'like', "%{$q}%")
                    ->orWhere('plate_number', 'like', "%{$q}%")
                    ->orWhere('make', 'like', "%{$q}%")
                    ->orWhere('model', 'like', "%{$q}%")
                    ->orWhere('status', 'like', "%{$q}%");
            });
        }

        $vehicles = $table->get(array_merge($this->rows, ['id', 'created_at', 'updated_at']));

        return response()->json(['vehicles' => $vehicles]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string',
        ]);

        $q = $request->input('q');

        try {
            $vehicles = DB::table('vehicles')
                ->where('vin', 'like', "%{$q}%")
                ->orWhere('plate_number', 'like', "%{$q}%")
                ->orWhere('make', 'like', "%{$q}%")
                ->orWhere('model', 'like', "%{$q}%")
                ->get(array_merge($this->rows, ['id', 'created_at', 'updated_at']));
        } catch (Exception $e) {
            return response()->json($e->getMessage(), 500);
        }

        return response()->json(['data' => $vehicles]);
    }

    public function register(Request $request)
    {
        $validated = (object) $request->validate([
            'vin'             => ['required', 'string', 'size:17', 'unique:vehicles,vin'],
            'plate_number'    => ['required', 'string', 'max:15', 'unique:vehicles,plate_number'],
            'make'            => ['required', 'string'],
            'model'           => ['required', 'string'],
            'year'            => ['required', 'digits:4', 'integer'],
            'type'            => ['required', 'string'],
            'capacity'        => ['nullable', 'numeric', 'min:0'],
            'seats'           => ['nullable', 'integer', 'min:1'],
            'fuel_efficiency' => ['required', 'numeric', 'min:0'],
            'acqdate'         => ['nullable', 'date'],
            'image'           => ['nullable', 'image', 'max:2048'], // max 2MB
        ]);

        try {
            DB::transaction(function () use ($validated, $request) {
                 $imagePath = null;

                if ($request->hasFile('image')) {
                    $imagePath = $request->file('image')->store('vehicles', 'public');
                }else{
                    $imagePath = 'vehicles/default.webp';
                }

                DB::table('vehicles')->insert([
                    'vin'              => $validated->vin,
                    'plate_number'     => $validated->plate_number,
                    'make'             => $validated->make,
                    'model'            => $validated->model,
                    'year'             => $validated->year,
                    'type'             => $validated->type,
                    'capacity'         => $validated->capacity,
                    'seats'            => $validated->seats,
                    'fuel_efficiency'  => $validated->fuel_efficiency,
                    'acquisition_date' => $validated->acqdate ? Carbon::parse($validated->acqdate)->format('Y-m-d') : null,
                    'status'           => 'Available',
                    'image_path'       => $imagePath,
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ]);
            });
        } catch (Exception $e) {
            return response()->json($e->getMessage(), 500);
        }

        return response()->json("Vehicle Registered", 200);
    }

    public function update(Request $request)
    {
        $validated = (object) $request->validate([
            'id'              => ['required', 'exists:vehicles,id'],
            'vin'             => ['required', 'string', 'size:17'],
            'plate_number'    => ['required', 'string', 'max:15'],
            'make'            => ['required', 'string'],
            'model'           => ['required', 'string'],
            'year'            => ['required', 'digits:4', 'integer'],
            'type'            => ['required', 'string'],
            'capacity'        => ['nullable', 'numeric', 'min:0'],
            'seats'           => ['nullable', 'integer', 'min:1'],
            'fuel_efficiency' => ['required', 'numeric', 'min:0'],
            'acqdate'         => ['nullable', 'date'],
            'status'          => ['required', Rule::in(['Available', 'Reserved', 'Under Maintenance', 'Retired'])],
        ]);

        try {
            DB::transaction(function () use ($validated) {
                DB::table('vehicles')
                    ->where('id', $validated->id)
                    ->update([
                        'vin'              => $validated->vin,
                        'plate_number'     => $validated->plate_number,
                        'make'             => $validated->make,
                        'model'            => $validated->model,
                        'year'             => $validated->year,
                        'type'             => $validated->type,
                        'capacity'         => $validated->capacity,
                        'seats'            => $validated->seats,
                        'fuel_efficiency'  => $validated->fuel_efficiency,
                        'acquisition_date' => $validated->acqdate ? Carbon::parse($validated->acqdate)->format('Y-m-d') : null,
                        'status'           => $validated->status,
                        'updated_at'       => now(),
                    ]);
            });

            $new = DB::table('vehicles')
                ->where('id', $validated->id)
                ->first(array_merge($this->rows, ['id', 'created_at', 'updated_at']));

            broadcast(new VehicleUpdates($new));
        } catch (Exception $e) {
            return response()->json($e->getMessage(), 500);
        }

        return response()->json("Record Updated Successfully", 200);
    }
}
