<?php 

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Exception;
use App\Services\MapboxService;
use Carbon\Carbon;

class Reservations extends Controller
{
    public function index(Request $request)
    {
        $q = $request->input('q');

        $table = DB::table('reservations as r');

        if ($q) {
            $table->where(function ($query) use ($q) {
                $query->where('r.batch_number', 'like', "%{$q}%")
                      ->orWhere('r.status', 'like', "%{$q}%")
                      ->orWhere('r.purpose', 'like', "%{$q}%");
            });
        }

        $table->orderBy('r.status', 'asc')
              ->orderBy('r.created_at', 'desc');

        $reservations = $table->paginate(15, [
            'r.id', 'r.uuid', 'r.batch_number', 'r.status', 'r.purpose', 'r.requestor_uuid', 'r.created_at'
        ]);

        return response()->json(['reservations' => $reservations], 200);
    }

    public function details(Request $request){
        $request->validate([
            'batch_number' => ['required', 'exists:reservations,batch_number'],
        ]);

        try{
            $reservation = DB::table('reservations as r')
                ->where('r.batch_number', $request['batch_number'])
                ->first([
                    'r.id',
                    'r.uuid',
                    'r.batch_number',
                    'r.purpose',
                    'r.status',
                    'r.start_date',
                    'r.end_date',
                    'r.requestor_uuid',
                    'r.created_at',
                    'r.updated_at',
                ]);

            if (!$reservation) {
                return response()->json(['error' => 'Reservation not found'], 404);
            }

            // === Assignments with vehicles & drivers ===
            $assignments = DB::table('assignments as a')
                ->leftJoin('vehicles as v', 'v.id', '=', 'a.vehicle_id')
                ->leftJoin('drivers as d', 'd.uuid', '=', 'a.driver_uuid')
                ->where('a.reservation_id', $reservation->id)
                ->get([
                    'a.id as assignment_id',
                    'a.reservation_id',
                    'v.id as vehicle_id',
                    'v.plate_number',
                    'v.model',
                    'v.type',
                    'v.capacity',
                    'v.status as vehicle_status',
                    'v.image_path',
                    'v.fuel_efficiency',
                    'd.uuid as driver_uuid',
                    'd.name as driver_name',
                    'd.status as driver_status',
                ])
                ->map(function ($row) {
                    $row->image_url = $row->image_path
                        ? asset('storage/' . $row->image_path)
                        : asset('storage/vehicles/default.webp');
                    return $row;
                });

            $assignmentByVehicle = $assignments->keyBy('vehicle_id');

            // === Trip Routes ===
            $tripRoutes = DB::table('trip_routes')
                ->where('reservation_id', $reservation->id)
                ->orderBy('sequence', 'asc')
                ->get();

            $tripRouteIds = $tripRoutes->pluck('id');

            $fuelPrice = config('services.fuel.price_per_liter', 65);
            $totalPriceCosts = 0.0;
            $tripMetrics = DB::table('trip_metrics as tm')
                ->join('trip_routes as tr', 'tr.id', '=', 'tm.trip_route_id')
                ->whereIn('tm.trip_route_id', $tripRouteIds)
                ->get([
                    'tm.id',
                    'tm.trip_route_id',
                    'tm.type',
                    'tm.distance',
                    'tm.duration',
                    'tm.geometry',
                    'tr.reservation_id',
                ])
                ->map(function ($m) use ($assignmentByVehicle, $fuelPrice, &$totalPriceCosts){
                    $distance = (float) $m->distance;
                    
                    $vehicleCosts = $assignmentByVehicle->map(function ($vehicle) use ($distance, $fuelPrice, &$totalPriceCosts) {
                        $fuelEfficiency = $vehicle->fuel_efficiency ?? 10; // L/100km
                        $cost = null;

                        if ($distance && $fuelEfficiency > 0) {
                            // distance in km, fuel_efficiency in L/100km
                            $litersConsumed = ($distance * $fuelEfficiency) / 100;
                            $cost = $litersConsumed * $fuelPrice;
                        }

                        if($cost != null){
                            $totalPriceCosts += $cost;
                        }

                        return [
                            'vehicle_id'      => $vehicle->vehicle_id,
                            'plate_number'    => $vehicle->plate_number,
                            'fuel_efficiency' => (float) $fuelEfficiency,
                            'cost'            => $cost ? round($cost, 2) : null,
                        ];
                    })->values();

                    return [
                        'id'            => $m->id,
                        'trip_route_id' => $m->trip_route_id,
                        'type'          => $m->type,
                        'distance'      => $distance,
                        'duration'      => $m->duration,
                        'vehicle_costs' => $vehicleCosts,
                        'geometry'      => $m->geometry
                    ];
                });
            
            $totals = [
                'totalFuelCost' => round($totalPriceCosts, 2),
                'totalFuelCostDoubleTrip' => round(($totalPriceCosts * 2), 2),
            ];
            // === Response ===
            $reservation = (array) $reservation;
            $reservation['assignments']   = $assignments;
            $reservation['trip_routes']   = $tripRoutes;
            $reservation['trip_metrics']  = $tripMetrics;
            $reservation['totals']        = $totals;

            return response()->json(['reservation' => $reservation], 200);
        }catch(Exception $e){
            Log::error('Reservation details failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
        
    }

    public function makeRequest(Request $request)
    {
        $validated = $request->validate([
            'purpose'        => 'nullable|string',
            'requestor_uuid' => 'required|uuid',
            'start_dt'     => 'required|date',
            'end_dt'       => 'required|date|after:start_dt',
            'trip_plan'      => 'required|array|min:2',
            'trip_plan.*.address_name' => 'required|string',
            'trip_plan.*.latitude'     => 'required|numeric',
            'trip_plan.*.longitude'    => 'required|numeric',
            'vehicle_ids'    => 'required|array|min:1',
            'vehicle_ids.*'  => 'exists:vehicles,id',
        ]);

        $uuid = (string) Str::uuid();
        $batch_number = strtoupper('BATCH-' . Str::random(8));

        try {
            DB::transaction(function () use ($validated, $uuid, $batch_number) {
                
                //Formatting
                $startFormatted = Carbon::parse($validated['start_dt'])->format('Y-m-d H:i:s');
                $endFormatted   = Carbon::parse($validated['end_dt'])->format('Y-m-d H:i:s');

                //RESERVATION
                $reservation_id = DB::table('reservations')->insertGetId([
                    'uuid'          => $uuid,
                    'batch_number'  => $batch_number,
                    'purpose'       => $validated['purpose'] ?? null,
                    'requestor_uuid'=> $validated['requestor_uuid'], 
                    'start_date'    => $startFormatted,
                    'end_date'      => $endFormatted,
                    'status'        => 'Pending',
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);

                foreach ($validated['vehicle_ids'] as $vid) {
                    DB::table('assignments')->insertGetId([
                        'reservation_id' => $reservation_id,
                        'vehicle_id'     => $vid,
                        'driver_uuid'    => null,
                        'created_at'     => now(),
                        'updated_at'     => now(),
                    ]);
                    
                    DB::table('vehicles')->where('id', $vid)->update(['status' => 'Reserved']);
                }
                

                for ($i = 0; $i < count($validated['trip_plan']) - 1; $i++) {
                    $current = $validated['trip_plan'][$i];
                    $next    = $validated['trip_plan'][$i + 1];

                    $trip_route_id = DB::table('trip_routes')->insertGetId([
                        'uuid'           => (string) Str::uuid(),
                        'reservation_id' => $reservation_id,

                        'start_address'   => $current['address_name'],
                        'start_latitude'  => $current['latitude'],
                        'start_longitude' => $current['longitude'],
                        
                        'end_address'     => $next['address_name'],
                        'end_latitude'    => $next['latitude'],
                        'end_longitude'   => $next['longitude'],

                        'sequence'        => $i + 1,
                        'created_at'      => now(),
                        'updated_at'      => now(),
                    ]);

                    $tripPlanIds[] = [
                        'id'  => $trip_route_id,
                        'start_address' => $current['address_name'],
                        'start_latitude' => $current['latitude'],
                        'start_longitude' => $current['longitude'],

                        'end_address'     => $next['address_name'],
                        'end_latitude'    => $next['latitude'],
                        'end_longitude'   => $next['longitude'],
                    ];
                }

                for ($i = 0; $i < count($tripPlanIds); $i++) {
                    $segment = $tripPlanIds[$i];

                    $route = MapboxService::getRoute(
                        $segment['start_longitude'],
                        $segment['start_latitude'],
                        $segment['end_longitude'],
                        $segment['end_latitude']
                    );

                    $distanceKm = $route['distance'] / 1000; // meters → km
                    $durationMin = $route['duration'] / 60; // seconds → minutes

                    DB::table('trip_metrics')->insert([
                        'uuid'        => (string) Str::uuid(),
                        'type'        => 'Pretrip',
                        'distance'    => $distanceKm,
                        'duration'    => round($durationMin),
                        'geometry'    => json_encode($route['geometry']),
                        'trip_route_id'=> $segment['id'],
                        'created_at'  => now(),
                        'updated_at'  => now(),
                    ]);
                }
            });
        } catch (Exception $e) {
            Log::error('Reservation insert failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data'  => $validated
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }

        return response()->json([
            'success'      => true,
            'batch_number' => $batch_number,
        ], 200);
    }

    public function approveReservation(Request $request){
        //approve reservation
        //add drivers per vehicles
        //create dispatch order
        $validated = $request->validate([
            'batch_number'              => ['required', 'exists:reservations,batch_number'],
            'assignments'               => ['required', 'array', 'min:1'],
            'assignments.*'             => ['required', 'array', 'min:1'],
            'assignments.*.vehicle_id'  => ['required', 'exists:vehicles,id'],
            'assignments.*.driver_uuid' => ['required', 'exists:drivers,uuid'],
        ]);

        try{
            DB::transaction(function () use ($validated) {
                $reservation = DB::table('reservations')
                    ->where('batch_number', $validated['batch_number'])
                    ->first(['id']);

                if (!$reservation) {
                    throw new Exception("Reservation not found");
                }

                DB::table('reservations')
                    ->where('id', $reservation->id)
                    ->update(['status' => 'Confirmed']);

                foreach ($validated['assignments'] as $assignment) {
                    DB::table('assignments')
                        ->where('reservation_id', $reservation->id)
                        ->where('vehicle_id', $assignment['vehicle_id'])
                        ->update([
                            'driver_uuid' => $assignment['driver_uuid'],
                            'updated_at'  => now(),
                        ]);

                    DB::table('drivers')
                        ->where('uuid', $assignment['driver_uuid'])
                        ->update(['status' => 'Assigned']);
                    
                    DB::table('dispatch_orders')->insert([
                        'uuid'          => (string) Str::uuid(),
                        'scheduled_time'=> now(),
                        'status'        => 'Scheduled',
                        'assignment_id' => DB::table('assignments')
                            ->where('reservation_id', $reservation->id)
                            ->where('vehicle_id', $assignment['vehicle_id'])
                            ->value('id'),
                        'created_at'    => now(),
                        'updated_at'    => now(),
                    ]);
                }
            });
            
            return response()->json([
                'message' => 'Reservation Approved',
            ], 200);
        }catch(Exception $e){
            Log::error('Approve Failed', ['error' => $e->getMessage()]);
            return response()->json('Approve Failed', 500);
        }
    }

    public function rejectReservation(Request $request)
    {
        $validated = $request->validate([
            'batch_number' => ['required', 'exists:reservations,batch_number'],
        ]);

        try {
            DB::transaction(function () use ($validated) {
    
                $reservation = DB::table('reservations')
                    ->where('batch_number', $validated['batch_number'])
                    ->first();

                if (!$reservation) {
                    throw new \Exception("Reservation not found");
                }

                DB::table('reservations')
                    ->where('id', $reservation->id)
                    ->update(['status' => 'Rejected']);

                // free drivers linked to assignments
                $assignments = DB::table('assignments')
                    ->where('reservation_id', $reservation->id)
                    ->get();

                foreach ($assignments as $assignment) {
                    if ($assignment->driver_uuid) {
                        DB::table('drivers')
                            ->where('uuid', $assignment->driver_uuid)
                            ->update(['status' => 'Available']);
                    }

                    if ($assignment->vehicle_id) {
                        DB::table('vehicles')
                            ->where('id', $assignment->vehicle_id)
                            ->update(['status' => 'Available']);
                    }
                }

                // clear assignments if needed
                DB::table('assignments')
                    ->where('reservation_id', $reservation->id)
                    ->update([
                        'driver_uuid' => null,
                    ]);
            });

        } catch (\Exception $e) {
            Log::error('Reject Failed', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString()
            ]);

            return response()->json(['error' => 'Reject failed'], 500);
        }

        return response()->json([
            'message' => 'Reservation Rejected',
        ], 200);
    }

}
