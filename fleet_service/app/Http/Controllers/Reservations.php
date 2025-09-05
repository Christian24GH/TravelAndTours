<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Exception;
use App\Events\ReservationUpdates;

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
            'batch_number', 'status', 'employee_id', 'created_at'
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
            ->where('r.batch_number', $request['batch_number'])
            ->first([
                'r.id', 
                'r.batch_number', 
                'r.start_time', 
                'r.end_time', 'r.status', 
                'r.created_at', 
                'r.employee_id',
                'r.pickup',
                'r.dropoff'
            ]);

        if (!$reservation) {
            return response()->json(['error' => 'Reservation not found'], 404);
        }

        $assignments = DB::table('assignments as a')
            ->join('vehicles as v', 'v.id', '=', 'a.vehicle_id')
            ->leftJoin('drivers as d', 'd.id', '=', 'a.driver_id')
            ->where('a.reservation_id', $reservation->id)
            ->get([
                'v.id as vehicle_id',
                'v.plate_number',
                'v.model',
                'v.type',
                'v.capacity',
                'v.status as vehicle_status',
                'd.id as driver_id',
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
    public function makeRequest(Request $request){
        $validated = $request->validate([
            'vehicle_ids'  => 'required|array|min:1',
            'vehicle_ids.*'=> 'exists:vehicles,id',
            'purpose'      => 'nullable|string',
            'employee_id'  => 'required|integer',
            'start_time'   => 'required|date|after:now',
            'end_time'     => 'required|date|after:start_time',
            'pickup'       => 'required|string|min:11',
            'dropoff'      => 'required|string|min:11'
        ]);

        $uuid = (string) Str::uuid();
        $batch_number = strtoupper('BATCH-' . Str::random(8));

        try {
            DB::transaction(function () use ($validated, $uuid, $batch_number, $request) {
                $reservation_id = DB::table('reservations')->insertGetId([
                    'uuid'        => $uuid,
                    'batch_number'=> $batch_number,
                    'purpose'     => $validated['purpose'] ?? null,
                    'employee_id' => $validated['employee_id'],
                    'pickup'      => $validated['pickup'],
                    'dropoff'     => $validated['dropoff'],
                    'status'      => 'Pending',
                    'start_time' => Carbon::parse($request->start_time)->format('Y-m-d H:i:s'),
                    'end_time'   => Carbon::parse($request->end_time)->format('Y-m-d H:i:s'),
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);

                foreach ($validated['vehicle_ids'] as $vid) {
                    DB::table('assignments')->insert([
                        'reservation_id' => $reservation_id,
                        'vehicle_id'     => $vid,
                        'driver_id'      => null,
                        'created_at'     => now(),
                        'updated_at'     => now(),
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

        /*
        try {
            $reservation = DB::table('reservations as r')
                ->leftJoin('reserved_vehicles as rv', 'rv.reservation_id', '=', 'r.id')
                ->leftJoin('vehicles as v', 'v.id', '=', 'rv.vehicle_id')
                ->where('r.uuid', $uuid)
                ->select('r.*', DB::raw('GROUP_CONCAT(v.vin) as vins'), DB::raw('GROUP_CONCAT(v.type) as types'))
                ->groupBy('r.id')
                ->first();

            broadcast(new ReservationUpdates($reservation));
        } catch (Exception $e) {
            return response()->json(['error' => 'Failed to fetch new data'], 500);
        }*/

        return response()->json([
            'success'     => true,
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
                    
                    DB::table('dispatches')
                        ->where('assignment_id', $a->id)
                        ->update([
                            'status'     => 'Cancelled',
                            'updated_at' => now(),
                        ]);


                    if ($a->vehicle_id) {
                        DB::table('vehicles')
                            ->where('id', $a->vehicle_id)
                            ->update(['status' => 'Available']);
                    }


                    if ($a->driver_id) {
                        DB::table('drivers')
                            ->where('id', $a->driver_id)
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
                    'r.employee_id',
                    'r.pickup',
                    'r.dropoff'
                ]);

            $assignments = DB::table('assignments as a')
                ->join('vehicles as v', 'v.id', '=', 'a.vehicle_id')
                ->leftJoin('drivers as d', 'd.id', '=', 'a.driver_id')
                ->where('a.reservation_id', $validated->id)
                ->get([
                    'v.id as vehicle_id',
                    'v.plate_number',
                    'v.model',
                    'v.type',
                    'v.capacity',
                    'v.status as vehicle_status',
                    'd.id as driver_id',
                    'd.name as driver_name',
                    'd.status as driver_status'
                ]);

            $reservation = (array) $reservation;
            $reservation['assignments'] = $assignments;

            broadcast(new ReservationUpdates($reservation));
        } catch (Exception $e) {
            return response()->json(['error' => 'Failed to fetch new data'], 500);
        }

        return response()->json(['success' => true], 200);
    }


    public function approveReservation(Request $request)
    {
        $validated = $request->validate([
            'id'          => 'required|exists:reservations,id',
            'assignments' => 'required|array|min:1',
            'assignments.*.vehicle_id' => 'required|exists:vehicles,id',
            'assignments.*.driver_id'  => 'required|exists:drivers,id',
        ]);

        try {
            DB::transaction(function () use ($validated) {
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
                    
                    DB::table('vehicles')
                        ->where('id', $assignment['vehicle_id'])
                        ->update(['status' => 'Reserved']);

                    
                    $rv = DB::table('assignments')
                        ->where('reservation_id', $validated['id'])
                        ->where('vehicle_id', $assignment['vehicle_id'])
                        ->first();

                    if (!$rv) {
                        throw new Exception("Vehicle {$assignment['vehicle_id']} not reserved in this reservation.");
                    }

                    DB::table('assignments')->where('id', $rv->id)->update([
                        'driver_id' => $assignment['driver_id'],
                    ]);

                    //TODO: Let the admin manage the schedule time later
                    $reservationStart = $r->start_time;
                    $scheduledTime = Carbon::parse($reservationStart)->subMinutes(60);

                    // Create dispatch
                    DB::table('dispatches')->updateOrInsert([
                        'uuid'                 => Str::uuid(),
                        'scheduled_time'       => $scheduledTime,
                        'start_time'           => $r->start_time,
                        'return_time'          => $r->end_time,
                        'status'               => 'Scheduled',
                        'assignment_id'        => $rv->id,
                        'created_at'           => now(),
                        'updated_at'           => now()
                    ]);

                    DB::table('drivers')
                        ->where('id', $assignment['driver_id'])
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
                    'r.end_time', 'r.status', 
                    'r.created_at', 
                    'r.employee_id',
                    'r.pickup',
                    'r.dropoff'
                ]);

            $assignments = DB::table('assignments as a')
                ->join('vehicles as v', 'v.id', '=', 'a.vehicle_id')
                ->leftJoin('drivers as d', 'd.id', '=', 'a.driver_id')
                ->where('a.reservation_id', $validated['id'])
                ->get([
                    'v.id as vehicle_id',
                    'v.plate_number',
                    'v.model',
                    'v.type',
                    'v.capacity',
                    'v.status as vehicle_status',
                    'd.id as driver_id',
                    'd.name as driver_name',
                    'd.status as driver_status'
                ]);


            $reservation = (array) $reservation;
            $reservation['assignments'] = $assignments;

            broadcast(new ReservationUpdates($reservation));
        } catch (Exception $e) {
            return response()->json(['error' => 'Failed to fetch new data'], 500);
        }
        
        return response()->json(['success' => true], 200);
    }

}
