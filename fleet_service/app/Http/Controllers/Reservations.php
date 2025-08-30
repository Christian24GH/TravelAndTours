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
    public function show(Request $request)
    {
        $q = $request->input('q');

        $table = DB::table('reservations as r')
            ->leftJoin('reserved_vehicles as rv', 'rv.reservation_id', '=', 'r.id')
            ->leftJoin('vehicles as v', 'v.id', '=', 'rv.vehicle_id');

        if ($q) {
            $table->where(function ($query) use ($q) {
                $query->where('r.uuid', 'like', "%{$q}%")
                    ->orWhere('r.start_time', 'like', "%{$q}%")
                    ->orWhere('r.end_time', 'like', "%{$q}%")
                    ->orWhere('r.status', 'like', "%{$q}%")
                    ->orWhere('r.purpose', 'like', "%{$q}%");
            });
        }

        $table->orderBy('r.status', 'asc')
            ->orderBy('r.created_at', 'desc');

        $reservations = $table->paginate(15, [
            'r.*',
            'v.type',
            'v.capacity',
        ]);

        return response()->json(['reservations' => $reservations], 200);
    }

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
                    'start_time'  => Carbon::parse($request->start_time)->format('Y-m-d H:i:s'),
                    'end_time'    => Carbon::parse($request->end_time)->format('Y-m-d H:i:s'),
                    'pickup'      => $validated['pickup'],
                    'dropoff'     => $validated['dropoff'],
                    'status'      => 'Pending',
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);

                foreach ($validated['vehicle_ids'] as $vid) {
                    DB::table('reserved_vehicles')->insert([
                        'reservation_id' => $reservation_id,
                        'vehicle_id'     => $vid,
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

                // Cancel related dispatch (via reserved_vehicles)
                $reservedVehicles = DB::table('reserved_vehicles')
                    ->where('reservation_id', $validated->id)
                    ->get();

                foreach ($reservedVehicles as $rv) {
                    DB::table('dispatches')
                        ->where('reserved_vehicles_id', $rv->id)
                        ->update([
                            'status'     => 'Cancelled',
                            'updated_at' => now(),
                        ]);

                    if ($rv->vehicle_id) {
                        DB::table('vehicles')
                            ->where('id', $rv->vehicle_id)
                            ->update(['status' => 'Available']);
                    }
                }

                // Free drivers if linked
                $dispatches = DB::table('dispatches as d')
                    ->join('reserved_vehicles as rv', 'rv.id', '=', 'd.reserved_vehicles_id')
                    ->where('rv.reservation_id', $validated->id)
                    ->get(['d.driver_id']);

                foreach ($dispatches as $d) {
                    if ($d->driver_id) {
                        DB::table('drivers')
                            ->where('id', $d->driver_id)
                            ->update(['status' => 'Available']);
                    }
                }
            });
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }

        try {
            $r = DB::table('reservations as r')
                ->leftJoin('reserved_vehicles as rv', 'rv.reservation_id', '=', 'r.id')
                ->leftJoin('vehicles as v', 'v.id', '=', 'rv.vehicle_id')
                ->where('r.id', $validated->id)
                ->first(['r.*', 'r.status', 'v.vin', 'v.type', 'v.capacity']);

            broadcast(new ReservationUpdates($r));
        } catch (Exception $e) {
            return response()->json(['error' => 'Failed to fetch new data'], 500);
        }

        return response()->json(['success' => true], 200);
    }

    public function approveReservation(Request $request){
        $validated = (object) $request->validate([
            'id'     => 'required|exists:reservations,id',
            'driver' => 'required|exists:drivers,id'
        ]);

        try {
            DB::transaction(function () use ($validated) {
                DB::table('reservations')
                    ->where('id', $validated->id)
                    ->update([
                        'status'     => 'Confirmed',
                        'updated_at' => now(),
                    ]);

                $reservedVehicles = DB::table('reserved_vehicles')
                    ->where('reservation_id', $validated->id)
                    ->get();

                $r = DB::table('reservations')->where('id', $validated->id)->first(['start_time', 'end_time']);

                foreach ($reservedVehicles as $rv) {
                    DB::table('vehicles')->where('id', $rv->vehicle_id)->update(['status' => 'Reserved']);

                    DB::table('dispatches')->insert([
                        'uuid'                => Str::uuid(),
                        'dispatch_time'       => $r->start_time,
                        'return_time'         => $r->end_time,
                        'status'              => 'In Progress',
                        'reserved_vehicles_id'=> $rv->id,
                        'driver_id'           => $validated->driver,
                        'created_at'          => now(),
                        'updated_at'          => now()
                    ]);
                }

                DB::table('drivers')->where('id', $validated->driver)->update(['status' => 'Assigned']);
            });
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }

        try {
            $reservation = DB::table('reservations as r')
                ->leftJoin('reserved_vehicles as rv', 'rv.reservation_id', '=', 'r.id')
                ->leftJoin('vehicles as v', 'v.id', '=', 'rv.vehicle_id')
                ->where('r.id', $validated->id)
                ->select('r.*', DB::raw('GROUP_CONCAT(v.vin) as vins'), DB::raw('GROUP_CONCAT(v.type) as types'))
                ->groupBy('r.id')
                ->first();

            broadcast(new ReservationUpdates($reservation));
        } catch (Exception $e) {
            return response()->json(['error' => 'Failed to fetch new data'], 500);
        }

        return response()->json(['success' => true], 200);
    }
}
