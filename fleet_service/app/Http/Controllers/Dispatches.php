<?php

namespace App\Http\Controllers;

use App\Events\DispatchUpdates;
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
            ->join('reservations as r', 'r.id', '=', 'd.reservation_id')
            ->join('vehicles as v', 'v.id', '=', 'r.vehicle_id')
            ->join('drivers as dr', 'dr.id', '=', 'd.driver_id');

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

        $allowed = ['Scheduled', 'Preparing', 'On Route', 'Completed', 'Cancelled', 'Closed'];
        if (! in_array($data['status'], $allowed)) {
            return response()->json(['message' => 'Invalid status value'], 422);
        }

        $now = Carbon::now();
        $update = [
            'status' => $data['status'],
        ];

        // update relevant timestamps depending on status transition
        switch ($data['status']) {
            case 'On Route':
                $update['start_time'] = $now;
                break;
            case 'Completed':
                $update['arrival_time'] = $now;
                break;
            case 'Closed':
                $update['return_time'] = $now;
                break;
            case 'Cancelled':
                // optionally set a cancelled_at timestamp (if you add one)
                $update['remarks'] = $data['remarks'] ?? null;
                break;
            default:
                // leave other fields untouched
                break;
        }

        if (isset($data['remarks'])) {
            $update['remarks'] = $data['remarks'];
        }

        DB::table('dispatches')->where('id', $data['dispatch_id'])->update($update);

        $dispatch = DB::table('dispatches')->where('id', $data['dispatch_id'])->first();

        // broadcast event if event class is available (non-fatal)
        if (class_exists(DispatchUpdates::class)) {
            try {
                broadcast(new DispatchUpdates($dispatch));
            } catch (\Throwable $e) {
                // don't fail request if broadcasting isn't configured
            }
        }

        return response()->json(['dispatch' => $dispatch], 200);
    }
}
