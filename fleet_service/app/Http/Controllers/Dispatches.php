<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Dispatches extends Controller
{
    public function show(Request $request){
        $q = $request->input('q');

        $table = DB::table('dispatches as d')
            ->join('reservations as r', 'r.id', '=', 'd.reservation_id');

        if($q) {
            $table->where(function ($query) use ($q) {
                $query->where('d.uuid', 'like', "%{$q}%")
                    ->orWhere('r.driver_id', 'like', "%{$q}%");
            });
        }

        $table->orderBy('d.status', 'asc')  
            ->orderBy('d.created_at', 'desc'); 

        $dispatch = $table->paginate(15, [
            'd.*',
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

}
