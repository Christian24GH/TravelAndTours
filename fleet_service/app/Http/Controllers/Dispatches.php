<?php

namespace App\Http\Controllers;

use App\Events\DispatchUpdates;
use App\Events\TrackingEvent;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Dispatches extends Controller
{
    public function show(Request $request){
        $q = $request->input('q');

        $table = DB::table('dispatches as d')
            ->join('assignments as a', 'a.id', '=', 'd.assignment_id')
            ->join('reservations as r', 'r.id', '=', 'a.reservation_id')
            ->join('vehicles as v', 'v.id', '=', 'a.vehicle_id')
            ->leftJoin('drivers as dv', 'dv.id', '=', 'a.driver_id');

        if($q) {
            $table->where(function ($query) use ($q) {
                $query->where('d.uuid', 'like', "%{$q}%")
                    ->orWhere('a.driver_id', 'like', "%{$q}%");
            });
        }

        $table->orderBy('d.status', 'asc')  
            ->orderBy('d.created_at', 'desc'); 

        $dispatch = $table->paginate(15, [
            'd.*',
            'v.type     as vehicle_type',
            'v.capacity as vehicle_capacity',
            'v.status   as vehicle_status',
            'dv.name     as driver_name',
            'dv.status   as driver_status',
            'r.batch_number as batch_number',
        ]);

        return response()->json(['dispatch' => $dispatch], 200);
    }

    public function showToDriver(Request $request){
        $driver_id   = $request->input('driver_id');
        $dispatch_id = $request->input('dispatch_id');

        $table = DB::table('dispatches as d')
            ->join('assignments as a', 'a.id', '=', 'd.id')
            ->join('reservations as r', 'r.id', '=', 'a.reservation_id')
            ->join('vehicles as v', 'v.id', '=', 'a.vehicle_id')
            ->join('drivers as dr', 'dr.id', '=', 'a.driver_id');

        // if dispatch_id is provided → ignore driver_id filter
        if ($dispatch_id) {
            $table->where('d.id', $dispatch_id);

            $table->orderBy('d.status', 'asc')
            ->orderBy('d.created_at', 'desc');

            $dispatch = $table->first();

            return response()->json(['dispatch' => $dispatch], 200);
            
        } elseif ($driver_id) {
            $table->where('d.driver_id', 'like', "%{$driver_id}%");

            $table->orderBy('d.status', 'asc')
            ->orderBy('d.created_at', 'desc');

            $dispatch = $table->get(['d.uuid', 'd.id', 'd.dispatch_time', 'd.status']);

            return response()->json(['dispatch' => $dispatch], 200);

        }

        $table->orderBy('d.status', 'asc')
            ->orderBy('d.created_at', 'desc');

        $dispatch = $table->get();

        return response()->json(['dispatch' => $dispatch], 200);

    }

    /**TODO
     * IMPLEMENT: UPDATE FUNCTIONS
     * LIVE DRIVER POSITION MONITORING
     */

    public function updateStatus(Request $request)
    {
        $data = $request->validate([
            'dispatch_id' => 'required|integer|exists:dispatches,id',
            'status'      => 'required|string',
            'remarks'     => 'nullable|string',
        ]);

        // Centralize allowed statuses
        $allowedStatuses = [
            'Scheduled',
            'Preparing',
            'Dispatched',
            'Arrived at Pickup',
            'On Route',
            'Completed',
            'Cancelled',
            'Closed',
        ];

        if (! in_array($data['status'], $allowedStatuses, true)) {
            return response()->json(['message' => 'Invalid status value'], 422);
        }

        $now = now();
        $update = [
            'status'  => $data['status'],
            'remarks' => $data['remarks'] ?? null,
        ];

        switch ($data['status']) {
            case 'Arrived at Pickup':
                $update['arrival_time'] = $now;
                break;

            case 'On Route':
                $update['start_time'] = $now;
                break;

            case 'Completed':
            case 'Closed':
                $update['return_time'] = $now;
                $update['closed_at'] = $now;
                break;

            case 'Cancelled':
                $update['cancelled_at'] = $now;
                break;
        }

        DB::table('dispatches')
            ->where('id', $data['dispatch_id'])
            ->update($update);

        $dispatch = DB::table('dispatches')->find($data['dispatch_id']);

        if (class_exists(DispatchUpdates::class)) {
            try {
                broadcast(new DispatchUpdates($dispatch));
            } catch (\Throwable $e) {
                // silent fail if broadcasting not configured
            }
        }

        return response()->json(['dispatch' => $dispatch], 200);
    }

    public function trackLocation(Request $request)
    {
        $data = $request->validate([
            'dispatch_id' => 'required|integer|exists:dispatches,id',
            'latitude'    => 'required|numeric|between:-90,90',
            'longitude'   => 'required|numeric|between:-180,180',
            'speed'       => 'nullable|numeric',
            'heading'     => 'nullable|numeric',
            'recorded_at' => 'nullable|date',
        ]);

        $location = DB::table('dispatch_locations')->insertGetId([
            'dispatch_id' => $data['dispatch_id'],
            'latitude'    => $data['latitude'],
            'longitude'   => $data['longitude'],
            'speed'       => $data['speed'] ?? null,
            'heading'     => $data['heading'] ?? null,
            'recorded_at' => $data['recorded_at'] ?? Carbon::now(),
            'created_at'  => Carbon::now(),
            'updated_at'  => Carbon::now(),
        ]);

        $saved = DB::table('dispatch_locations')->find($location);

        // Broadcast location update (non-fatal if broadcasting not configured)
        if (class_exists(TrackingEvent::class)) {
            try {
                broadcast(new TrackingEvent($saved));
            } catch (\Throwable $e) {
                // log or silently ignore
            }
        }

        return response()->json([
            'message'  => 'Location tracked successfully',
            'location' => $saved,
        ], 201);
    }
}
