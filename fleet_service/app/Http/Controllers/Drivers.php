<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Drivers extends Controller
{
    public function get(){
        //get data from hr?
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
