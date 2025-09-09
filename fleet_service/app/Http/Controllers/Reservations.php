<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Exception;
use App\Events\ReservationUpdates;
use App\Services\MapboxService;

class Reservations extends Controller
{

    /**
     * TODO:
     *  Default ( no params ) - return reservation batch_number, status, created_at order by created_at
     *  Search - return batch
     *  
     */
    public function index(Request $request)
    {
        $q = $request->input('q');

        $table = DB::table('reservations as r');

        if ($q) {
            $table->where(function ($query) use ($q) {
                $query->where('r.batch_number', 'like', "%{$q}%")
                    ->orWhere('r.start_time', 'like', "%{$q}%")
                    ->orWhere('r.end_time', 'like', "%{$q}%")
                    ->orWhere('r.status', 'like', "%{$q}%")
                    ->orWhere('r.purpose', 'like', "%{$q}%");
            });
        }

        $table->orderBy('r.status', 'asc')
            ->orderBy('r.created_at', 'desc');

        $reservations = $table->paginate(15, [
            'batch_number', 'status', 'requestor_uuid', 'created_at'
        ]);

        return response()->json(['reservations' => $reservations], 200);

    }

    /** Show details on specific reservation 
     * 
     *  TODO: On Integration, connect requestor.
     * 
    */
    public function details(Request $request){
        $request->validate([
            'batch_number'=>['required', 'exists:reservations,batch_number'],
        ]);

        $reservation = DB::table('reservations as r')
            ->leftJoin('trip_data as t', 't.reservation_id', '=', 'r.id')
            ->where('r.batch_number', $request['batch_number'])
            ->first([
                'r.id',
                'r.batch_number',
                'r.start_time',
                'r.end_time',
                'r.status',
                'r.created_at',
                'r.requestor_uuid',
                'r.pickup',
                'r.dropoff',
                't.pretrip_cost',
                't.pretrip_distance',
                't.pretrip_duration',
                't.pretrip_geometry'
            ]);

        if (!$reservation) {
            return response()->json(['error' => 'Reservation not found'], 404);
        }

        $assignments = DB::table('assignments as a')
            ->join('vehicles as v', 'v.id', '=', 'a.vehicle_id')
            ->leftJoin('drivers as d', 'd.uuid', '=', 'a.driver_uuid')
            ->where('a.reservation_id', $reservation->id)
            ->get([
                'v.id as vehicle_id',
                'v.plate_number',
                'v.model',
                'v.type',
                'v.capacity',
                'v.status as vehicle_status',
                'd.uuid as driver_uuid',
                'd.name as driver_name',
                'd.status as driver_status'
            ]);

        
        $reservation = (array) $reservation;
        $reservation['assignments'] = $assignments;

        
        return response()->json(['reservation'=>$reservation], 200);
    }

    /**TODO
     * Prevent accepting request with vehicles that have reservation and booking that has the same allotted date on the request.
     */
    public function makeRequest(Request $request)
    {
        $validated = $request->validate([
            'vehicle_ids'    => 'required|array|min:1',
            'vehicle_ids.*'  => 'exists:vehicles,id',   //must be referenced by uuid
            'purpose'        => 'nullable|string',
            'requestor_uuid' => 'required|uuid',
            'start_time'     => 'required|date|after:now',
            'end_time'       => 'required|date|after:start_time',
            'pickup'         => 'required|string|min:11', // JSON string {address, coordinates}
            'dropoff'        => 'required|string|min:11' // JSON string {address, coordinates}
        ]);

        $uuid = (string) Str::uuid();
        $batch_number = strtoupper('BATCH-' . Str::random(8));

        $pickup  = json_decode($validated['pickup'], true);
        $dropoff = json_decode($validated['dropoff'], true);

        [$startLng, $startLat] = $pickup['coordinates'];
        [$endLng, $endLat]     = $dropoff['coordinates'];

        try {
            $route = MapboxService::getRoute($startLng, $startLat, $endLng, $endLat);

            $distanceKm   = $route['distance'] / 1000;       // meters → km
            $durationMins = round($route['duration'] / 60);  // seconds → minutes
            $geometry     = $route['geometry'];
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error'   => $e->getMessage()
            ], 500);
        }

        try {
            DB::transaction(function () use ($validated, $uuid, $batch_number, $distanceKm, $durationMins, $geometry) {
                // Insert into reservations
                $reservation_id = DB::table('reservations')->insertGetId([
                    'uuid'          => $uuid,
                    'batch_number'  => $batch_number,
                    'purpose'       => $validated['purpose'] ?? null,
                    'requestor_uuid'=> $validated['requestor_uuid'], 
                    'pickup'        => $validated['pickup'],   // stored as JSON string
                    'dropoff'       => $validated['dropoff'],  // stored as JSON string
                    'status'        => 'Pending',
                    'start_time'    => Carbon::parse($validated['start_time'])->format('Y-m-d H:i:s'),
                    'end_time'      => Carbon::parse($validated['end_time'])->format('Y-m-d H:i:s'),
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);

                // Insert into trip_data
                DB::table('trip_data')->insert([
                    'uuid'             => (string) Str::uuid(),
                    'reservation_id'   => $reservation_id,
                    'pretrip_cost'     => null, // calculate later
                    'pretrip_distance' => $distanceKm,
                    'pretrip_duration' => $durationMins,
                    'pretrip_geometry' => json_encode($geometry),
                ]);

                // Insert into assignments
                foreach ($validated['vehicle_ids'] as $vid) {
                    DB::table('assignments')->insert([
                        'reservation_id' => $reservation_id,
                        'vehicle_id'     => $vid,
                        'driver_uuid'    => null,
                        'created_at'     => now(),
                        'updated_at'     => now(),
                    ]);

                    DB::table('vehicles')->where('id', $vid)->update(['status' => 'Reserved']);
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



    public function cancelRequest(Request $request)
    {
        $validated = (object) $request->validate([
            'id' => 'required|exists:reservations,id',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                // Cancel reservation
                DB::table('reservations')
                    ->where('id', $validated->id)
                    ->update([
                        'status'     => 'Cancelled',
                        'updated_at' => now(),
                    ]);

                $assignments = DB::table('assignments')
                    ->where('reservation_id', $validated->id)
                    ->get();

                foreach ($assignments as $a) {
                    // Cancel dispatches
                    DB::table('dispatches')
                        ->where('assignment_id', $a->id)
                        ->update([
                            'status'     => 'Cancelled',
                            'updated_at' => now(),
                        ]);

                    // Reset vehicle status
                    if ($a->vehicle_id) {
                        DB::table('vehicles')
                            ->where('id', $a->vehicle_id)
                            ->update(['status' => 'Available']);
                    }

                    // Reset driver status (uuid, not id)
                    if ($a->driver_uuid) {
                        DB::table('drivers')
                            ->where('uuid', $a->driver_uuid)
                            ->update(['status' => 'Available']);
                    }
                }
            });
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }

        try {
            $reservation = DB::table('reservations as r')
                ->where('r.id', $validated->id)
                ->first([
                    'r.id',
                    'r.batch_number',
                    'r.start_time',
                    'r.end_time',
                    'r.status',
                    'r.created_at',
                    'r.requestor_uuid',
                    'r.pickup',
                    'r.dropoff'
                ]);

            $assignments = DB::table('assignments as a')
                ->join('vehicles as v', 'v.id', '=', 'a.vehicle_id')
                ->leftJoin('drivers as d', 'd.uuid', '=', 'a.driver_uuid')
                ->where('a.reservation_id', $validated->id)
                ->get([
                    'v.id as vehicle_id',
                    'v.plate_number',
                    'v.model',
                    'v.type',
                    'v.capacity',
                    'v.status as vehicle_status',
                    'd.uuid as driver_uuid',
                    'd.name as driver_name',
                    'd.status as driver_status'
                ]);

            $reservation = (array) $reservation;
            $reservation['assignments'] = $assignments;

            broadcast(new ReservationUpdates($reservation));
        } catch (Exception $e) {
            // optional: log error
        }

        return response()->json(['success' => true], 200);
    }



    public function approveReservation(Request $request)
    {
        $validated = $request->validate([
            'id'                        => 'required|exists:reservations,id',
            'assignments'               => 'required|array|min:1',
            'assignments.*.vehicle_id'  => 'required|exists:vehicles,id',
            'assignments.*.driver_uuid' => 'required|exists:drivers,uuid',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                // Confirm reservation
                DB::table('reservations')
                    ->where('id', $validated['id'])
                    ->update([
                        'status'     => 'Confirmed',
                        'updated_at' => now(),
                    ]);

                $r = DB::table('reservations')
                    ->where('id', $validated['id'])
                    ->first(['start_time', 'end_time']);

                foreach ($validated['assignments'] as $assignment) {
                    // Reserve vehicle
                    DB::table('vehicles')
                        ->where('id', $assignment['vehicle_id'])
                        ->update(['status' => 'Reserved']);

                    // Find assignment
                    $rv = DB::table('assignments')
                        ->where('reservation_id', $validated['id'])
                        ->where('vehicle_id', $assignment['vehicle_id'])
                        ->first();

                    if (!$rv) {
                        throw new Exception("Vehicle {$assignment['vehicle_id']} not reserved in this reservation.");
                    }

                    // Update assignment with driver
                    DB::table('assignments')
                        ->where('id', $rv->id)
                        ->update([
                            'driver_uuid' => $assignment['driver_uuid'],
                            'updated_at'  => now(),
                        ]);

                    // Schedule dispatch (match by assignment_id only!)
                    $reservationStart = $r->start_time;
                    $scheduledTime = Carbon::parse($reservationStart)->subMinutes(60);

                    DB::table('dispatches')->updateOrInsert(
                        ['assignment_id' => $rv->id], // ✅ match by assignment_id
                        [
                            'uuid'           => (string) Str::uuid(),
                            'scheduled_time' => $scheduledTime,
                            'start_time'     => $r->start_time,
                            'return_time'    => $r->end_time,
                            'status'         => 'Scheduled',
                            'updated_at'     => now(),
                            'created_at'     => now(),
                        ]
                    );

                    // Update driver status
                    DB::table('drivers')
                        ->where('uuid', $assignment['driver_uuid'])
                        ->update(['status' => 'Assigned']);
                }
            });
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }

        try {
            $reservation = DB::table('reservations as r')
                ->where('r.id', $validated['id'])
                ->first([
                    'r.id',
                    'r.batch_number',
                    'r.start_time',
                    'r.end_time',
                    'r.status',
                    'r.created_at',
                    'r.requestor_uuid', // ✅ fixed
                    'r.pickup',
                    'r.dropoff'
                ]);

            $assignments = DB::table('assignments as a')
                ->join('vehicles as v', 'v.id', '=', 'a.vehicle_id')
                ->leftJoin('drivers as d', 'd.uuid', '=', 'a.driver_uuid')
                ->where('a.reservation_id', $validated['id'])
                ->get([
                    'v.id as vehicle_id',
                    'v.plate_number',
                    'v.model',
                    'v.type',
                    'v.capacity',
                    'v.status as vehicle_status',
                    'd.uuid as driver_uuid',
                    'd.name as driver_name',
                    'd.status as driver_status'
                ]);

            $reservation = (array) $reservation;
            $reservation['assignments'] = $assignments;

            broadcast(new ReservationUpdates($reservation));
        } catch (Exception $e) {
            // optional: log error
        }

        return response()->json(['success' => true], 200);
    }


}
