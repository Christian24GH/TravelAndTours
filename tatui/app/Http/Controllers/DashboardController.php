<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request){
        //dd($request->auth_user);

        $data = [
            'user'=> $request->auth_user,
        ];

        return Inertia('super-admin-dashboard', $data);
    }
}
