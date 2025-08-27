<?php

namespace App\Http\Controllers;

use App\Events\Maintenance as EventsMaintenance;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class Maintenance extends Controller
{
    public function request(Request $request){
        $validated = (object) $request->validate([
            'vehicle_id'    => ['required', 'exists:vehicle,id'],
            'service_date'  => ['required', 'date'],
            'service_type'  => ['required', Rule::in(['repair','preventive','inspection'])]
        ]);

        try{
            $new = DB::table('vehicle_maintenance')->insert([
                'vehicle_id'    =>  $validated->vehicle_id,
                'service_date'  =>  Carbon::parse($validated->service_date)->format('Y-m-d'),
                'service_type'  =>  $validated->service_type,
                'status'        =>  'pending',
                'created_at'    =>  now(),
                'updated_at'    =>  now()
            ]);
            
            broadcast(new EventsMaintenance($new));
        }catch(Exception $e){
            return response()->json($e, 500);
        }

        return response()->json('Maintenance Request Created!', 200);
    }

    public function update(Request $request){
        $table = DB::table('vehicle_maintenance');
        $validated = (object) $request->validate([
            'id'            => ['required', 'exists:vehicle_maintenance,id'],
            //'service_date'  => ['required', 'date'],
            //'service_type'  => ['required', Rule::in(['repair','preventive','inspection'])],
            //'status'        => ['required', Rule::in(['pending', 'approved', 'rejected', 'ongoing', 'due_soon', 'overdue', 'snoozed', 'done'])],
        ]);
        
        $vehicle_id = $table->where('id', $validated->id)->first('vehicle_id');
        dd($vehicle_id);

        try{
            DB::transaction(function() use($validated, $table, $vehicle_id){
                $table->where('id', $validated->id)->update([
                    'service_date'  =>  Carbon::parse($validated->service_date)->format('Y-m-d'),
                    'service_type'  =>  $validated->service_type,
                    'status'        =>  $validated->status,
                    'updated_at'    =>  now(),
                ]);

                if($validated->status === 'approved'){
                    DB::table('vehicles')->where('id', $vehicle_id)
                        ->update([
                            'status' => 'under_maintenance'
                        ]);
                }
            });
            


            $new = DB::table('vehicle_maintenance')->where('id', $validated->id)->first();
            broadcast(new EventsMaintenance($new));
        }catch(Exception $e){
            return response()->json($e, 500);
        }

        return response()->json('Maintenance Request Created!', 200);
    }
    
}
