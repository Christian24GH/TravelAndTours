<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class APIController extends Controller
{

    # For Logistics 2 Fetches Drivers from Human Resource
    public function getDrivers(Request $request){
        $request->validate([
            'id' => 'nullable|integer'
        ]);

        $query = User::where('role', 'Driver');

        if ($request->filled('id')) {
            $driver = $query->where('id', $request->input('id'))->first(['id', 'name']);
            return response()->json(['record' => $driver], 200);
        }

        $drivers = $query->get(['id', 'name']);
        return response()->json(['record' => $drivers], 200);
    }
}
