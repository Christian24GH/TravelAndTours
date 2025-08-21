<?php

namespace App\Http\Controllers;

use App\Events\ReservationUpdates;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class Reservations extends Controller
{
    public function show(Request $request){

        $table = DB::table('reservations', 'r');
        
        $q = $request->input('q');

        if($request->filled('q')){
            try{
                $table->where('uuid', 'like', "%{$q}%")
                    ->orWhere('start_time', 'like', "%{$q}%")
                    ->orWhere('end_time', 'like', "%{$q}%")
                    ->orWhere('status', 'like', "%{$q}%")
                    ->orWhere('purpose', 'like', "%{$q}%");
            }catch(Exception $e){
                return response()->json(['error' => $e->getMessage()], 500);
            }
        }

        $table->join('vehicles as v', 'v.id', '=', 'r.vehicle_id')->get(['r.*', 'r.status', 'v.vin']);
        
        $reservations = $table->paginate(15);

        return response()->json(['reservations'=>$reservations], 200);
    }

    public function makeRequest(Request $request){
        
        $validated = $request->validate([
            'vehicle_id'    => 'required|exists:vehicles,id',
            'purpose'       => 'nullable|string',
            'employee_id'   => 'required|integer',
            'start_time'    => 'required|date|after:now',
            'end_time'      => 'required|date|after:start_time',
        ]);
        
        try{
            $r = DB::table('reservations')->insert([
                'uuid'       => (string) Str::uuid(),
                'vehicle_id' => $validated['vehicle_id'],
                'purpose'    => $validated['purpose'] ?? null,
                'employee_id'=> $validated['employee_id'] ?? null,
                'start_time' => $request->start_time ? Carbon::parse($request->start_time)->format('Y-m-d H:i:s') : null,
                'end_time'   => $request->end_time ? Carbon::parse($request->end_time)->format('Y-m-d H:i:s') : null,
                'status'     => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            broadcast(new ReservationUpdates($r));
        }catch(Exception $e){
             Log::error('Reservation insert failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data'  => $validated
            ]);
            
            return response()->json(['error' => $e->getMessage()], 500);
        }

        return response()->json(['success' => true], 201);
    }

    public function changeRequest(Request $request){
        $validated = (object) $request->validate([
            'id'          => 'required|exists:reservations,id',
            'start_time'  => 'required|date|after:now',
            'end_time'    => 'required|date|after:start_time',
            'vehicle_id'  => 'required|exists:vehicles,id',
            'purpose'     => 'nullable|string',
            'employee_id' => 'nullable|integer',
        ]);
            
        try{
            DB::table('reservations')
                ->where('id', $validated->id)
                ->update([
                    'vehicle_id'  => $validated->vehicle_id,
                    'purpose'     => $validated->purpose,
                    'employee_id' => $validated->employee_id,
                    'start_time'  => $validated->start_time,
                    'end_time'    => $validated->end_time,
                    'updated_at'  => now(),
                ]);
        }catch(Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }

        return response()->json(['success' => true], 200);
    }

    public function cancelRequest(Request $request){
        $validated = (object) $request->validate([
            'id' => 'required|exists:reservations,id',
        ]);
            
        try{
            DB::transaction(function () use ($validated) {
                // Cancel reservation
                DB::table('reservations')
                    ->where('id', $validated->id)
                    ->update([
                        'status'     => 'Cancelled',
                        'updated_at' => now(),
                    ]);

                // Cancel related dispatch (if any)
                DB::table('dispatches')
                    ->where('reservation_id', $validated->id)
                    ->update([
                        'status'     => 'Cancelled',
                        'updated_at' => now(),
                    ]);

                $reservation = DB::table('reservations')
                    ->where('id', $validated->id)
                    ->first(['vehicle_id']);

                if ($reservation && $reservation->vehicle_id) {
                    DB::table('vehicles')
                        ->where('id', $reservation->vehicle_id)
                        ->update(['status' => 'Available']);
                }

                $dispatch = DB::table('dispatches')
                    ->where('reservation_id', $validated->id)
                    ->first(['driver_id']);

                if ($dispatch && $dispatch->driver_id) {
                    DB::table('drivers')
                        ->where('id', $dispatch->driver_id)
                        ->update(['status' => 'Available']);
                }
            });
        }catch(Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }

        return response()->json(['success' => true], 200);
    }

    public function approveReservation(Request $request){

        $validated = (object) $request->validate([
            'id' => 'required|exists:reservations,id',
            'driver' => 'required|exists:drivers,id'
        ]);

        try{
            DB::transaction(function () use($validated){
                DB::table('reservations')
                    ->where('id', $validated->id)
                    ->update([
                        'status'     => 'Confirmed',
                        'updated_at' => now(),
                    ]);
                $v = DB::table('reservations')->where('id', $validated->id)->first('vehicle_id');
                DB::table('vehicles')->where('id', $v->vehicle_id)->update(['status' => 'Reserved']);
                DB::table('drivers')->where('id', $validated->driver)->update(['status' => 'Assigned']);
                
                $r = DB::table('reservations')->where('id', $validated->id)->first(['start_time', 'end_time']);
                //dd($r);
                DB::table('dispatches')->insert([
                    'uuid'          => Str::uuid(),
                    'dispatch_time' => $r->start_time,
                    'return_time'   => $r->end_time,
                    'status'        => 'In Progress',
                    'reservation_id'=> $validated->id ?? null,
                    'driver_id'     => $validated->driver ?? null,
                    'created_at'    => now(),
                    'updated_at'    => now()
                ]);
            });

            //vehicle status Update
        }catch(Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }

        return response()->json(['success' => true], 200);
    }

    public function updateStatus(Request $request){
        $validated = (object) $request->validate([
            'id'     => 'required|exists:reservations,id',
            'status' => 'required|in:pending,confirmed',
        ]);

        try {
            DB::table('reservations')
                ->where('id', $validated->id)
                ->update([
                    'status'     => $validated->status,
                    'updated_at' => now(),
                ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }

        return response()->json(['success' => true], 200);
    }

}
