<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Reservations extends Controller
{
    public function makeRequest(Request $request){
        $validated = (object) $request->validate([
            'vehicle_id'   => 'required|exists:vehicles,id',
            'tour_id'      => 'nullable|integer',
            'customer_id'  => 'nullable|integer',
            'start_time'   => 'required|date|after:now',
            'end_time'     => 'required|date|after:start_time',
        ]);
        try{
            DB::table('reservations')->insert([
                'uuid'        => Str::uuid(),
                'vehicle_id'  => $validated->vehicle_id,
                'tour_id'     => $validated->tour_id,
                'customer_id' => $validated->customer_id,
                'start_time'  => $validated->start_time,
                'end_time'    => $validated->end_time,
                'status'      => 'pending',
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }catch(Exception $e){
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
            'tour_id'     => 'nullable|integer',
            'customer_id' => 'nullable|integer',
        ]);
            
        try{
            DB::table('reservations')
                ->where('id', $validated->id)
                ->update([
                    'vehicle_id'  => $validated->vehicle_id,
                    'tour_id'     => $validated->tour_id,
                    'customer_id' => $validated->customer_id,
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
            DB::table('reservations')
                ->where('id', $validated->id)
                ->update([
                    'status'     => 'cancelled',
                    'updated_at' => now(),
                ]);
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
