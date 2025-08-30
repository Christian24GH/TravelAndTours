<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
class Drivers extends Controller
{
    public function get(){
        $data = Http::get('http://localhost:8091/api/getDrivers');
        $response = json_decode($data->body(), true); 

        $records = $response['record'] ?? [];
        
        try {
            DB::transaction(function () use ($records) {
                if (isset($records[0])) {
                    // multiple drivers
                    foreach ($records as $driver) {
                        DB::table('drivers')->insertOrIgnore([
                            'id'     => $driver['id'],
                            'uuid'   => Str::uuid(),
                            'name'   => $driver['name'],
                            'status' => 'Available'
                        ]);
                    }
                } elseif (!empty($records)) {
                    // single driver
                    DB::table('drivers')->insertOrIgnore([
                        'id'     => $records['id'],
                        'uuid'   => Str::uuid(),
                        'name'   => $records['name'],
                        'status' => 'Available'
                    ]);
                }
            });
        } catch (Exception $e) {
            return response()->json('Failed to fetch driver records: '.$e->getMessage(), 400);
        }

        return response(null, 200);
    }

    public function show(Request $request){
        $table = DB::table('drivers');
        $q = $request->input('q');

        if($request->filled('q')){
            try{
                $table->where('status', 'Like', "%{$q}%");
            }catch(Exception $e){
                return response()->json($e, 500);
            }
        }

        $driver = $table->get();

        return response()->json(['drivers'=> $driver], 200);
    }

    public function rate(){

    }
}
