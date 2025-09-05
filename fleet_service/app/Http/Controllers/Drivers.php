<?php

namespace App\Http\Controllers;

use App\Events\DriverEvent;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
class Drivers extends Controller
{
    public function get()
    {
        $data = Http::get('http://localhost:8091/api/getDrivers');
        $response = json_decode($data->body(), true); 

        $records = $response['record'] ?? [];

        try {
            DB::transaction(function () use ($records) {
                $toInsert = is_array($records[0] ?? null) ? $records : [$records];

                foreach ($toInsert as $driver) {
                    $exists = DB::table('drivers')->where('id', $driver['id'])->exists();

                    if (! $exists) {
                        $data = [
                            'uuid'   => Str::uuid(),
                            'name'   => $driver['name'],
                            'status' => 'Available'
                        ];

                        DB::table('drivers')->insert($data);

                        broadcast(new DriverEvent($data));
                    } else {
                        $data = [
                            'name'   => $driver['name'],
                            'status' => 'Available'
                        ];

                        DB::table('drivers')
                            ->where('id', $driver['id'])
                            ->update($data);

                        $data['id'] = $driver['id']; // add id for frontend clarity

                        broadcast(new DriverEvent($data));
                    }
                }
            });
        } catch (Exception $e) {
            return response()->json('Failed to fetch driver records: '.$e->getMessage(), 400);
        }

        return response(null, 200);
    }

    public function dialogShow(Request $request){
        $table = DB::table('drivers');
        $q = $request->input('q');

        if($request->filled('q')){
            try{
                $table->where('name', 'Like', "%{$q}%")
                    ->orWhere('status', 'Like', "%{$q}");
            }catch(Exception $e){
                return response()->json($e, 500);
            }
        }

        $driver = $table->get();

        return response()->json(['drivers'=> $driver], 200);
    }

    public function show(Request $request){
        $table = DB::table('drivers');
        $q = $request->input('q');

        if($request->filled('q')){
            try{
                $table->where('name', 'Like', "%{$q}%")
                    ->orWhere('status', 'Like', "%{$q}");
            }catch(Exception $e){
                return response()->json($e, 500);
            }
        }

        $driver = $table->paginate(15);

        return response()->json(['drivers'=> $driver], 200);
    }

    public function rate(){

    }
}
