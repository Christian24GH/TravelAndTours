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
                $query->where('d.uuid', 'like', "%{$q}%");
            });
        }

        $table->orderBy('d.status', 'asc')  
            ->orderBy('d.created_at', 'desc'); 

        $dispatch = $table->paginate(15, [
            'd.*',
        ]);

        return response()->json(['dispatch' => $dispatch], 200);
    }

}
