<?php

namespace App\Http\Controllers;

use App\Events\VehicleUpdates;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Vehicles extends Controller
{
    // Include all visible columns
    private $rows = [
        'vin', 'plate_number', 'make', 'model', 'year',
        'type', 'capacity', 'acquisition_date', 'status'
    ];

   public function show(Request $request)
    {
        $table = DB::table('vehicles');
        $q = $request->input('q');

        if ($request->filled('q')) {
            try{
                $table->where('vin', 'like', "%{$q}%")
                    ->orWhere('plate_number', 'like', "%{$q}%")
                    ->orWhere('make', 'like', "%{$q}%")
                    ->orWhere('model', 'like', "%{$q}%")
                    ->get(array_merge($this->rows, ['id', 'created_at', 'updated_at']));

            }catch(Exception $e){
                return response()->json($e, 500);
            }
        }

        $vehicles = $table->paginate(15, array_merge($this->rows, ['id', 'created_at', 'updated_at']));

        return response()->json(['vehicles' => $vehicles]);
    }
    public function showAll()
    {
        $vehicles = DB::table('vehicles')
            ->get(array_merge($this->rows, ['created_at', 'updated_at']));

        return response()->json(['vehicles' => $vehicles]);
    }

    public function search(Request $request){
        
        $query = $request->validate([
            'q' => 'string',
        ]);

        if (!$query) {
            return response()->json(['message' => 'Search query is required'], 400);
        }

        try{
            $vehicles = DB::table('vehicles')
                ->where('vin', 'like', "%{$query}%")
                ->orWhere('plate_number', 'like', "%{$query}%")
                ->orWhere('make', 'like', "%{$query}%")
                ->orWhere('model', 'like', "%{$query}%")
                ->get(array_merge($this->rows, ['id', 'created_at', 'updated_at']));

        }catch(Exception $e){
            return response()->json($e, 500);
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
            'year'            => ['required', 'digits:4'],
            'type'            => ['required', 'string'],
            'capacity'        => ['nullable', 'integer'],
            'acqdate'         => ['nullable', 'date'],
        ]);

        try {
            DB::transaction(function () use ($validated) {
                DB::table('vehicles')->insert([
                    'vin'             => $validated->vin,
                    'plate_number'    => $validated->plate_number,
                    'make'            => $validated->make,
                    'model'           => $validated->model,
                    'year'            => $validated->year,
                    'type'            => $validated->type,
                    'capacity'        => $validated->capacity,
                    'acquisition_date'=> Carbon::parse($validated->acqdate)->format('Y-m-d'),
                    'status'          => 'active',
                    'created_at'      => now(),
                    'updated_at'      => now(),
                ]);
            });
        } catch (Exception $e) {
            return response()->json($e->getMessage(), 500);
        }

        try {
            $new = DB::table('vehicles')
                ->where('vin', $validated->vin)
                ->first(array_merge($this->rows, ['id', 'created_at', 'updated_at']));

            broadcast(new VehicleUpdates($new));
        } catch (Exception $e) {
            return response()->json('Failed to fetch new data', 500);
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
            'year'            => ['required', 'digits:4'],
            'type'            => ['required', 'string'],
            'capacity'        => ['nullable', 'integer'],
            'acqdate'         => ['nullable', 'date'],
            'status'          => ['required', 'in:active,under_maintenance,retired']
        ]);

        try {
            DB::transaction(function () use ($validated) {
                DB::table('vehicles')
                    ->where('id', $validated->id)
                    ->update([
                        'vin'             => $validated->vin,
                        'plate_number'    => $validated->plate_number,
                        'make'            => $validated->make,
                        'model'           => $validated->model,
                        'year'            => $validated->year,
                        'type'            => $validated->type,
                        'capacity'        => $validated->capacity,
                        'acquisition_date'=> Carbon::parse($validated->acqdate)->format('Y-m-d'),
                        'status'          => $validated->status,
                        'updated_at'      => now(),
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
