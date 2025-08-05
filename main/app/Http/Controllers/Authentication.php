<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class Authentication extends Controller
{
    public function registerView(Request $request){
        return Inertia::render('register');
    }
    public function register(Request $request){
        //dd($request);
        $credentials = $request->validate(
            [
                'Name'=>    'required|string|min:3',
                'Password'=>'required|string|min:6',
                'Email'=>   'required|email|unique:users,email',
                'Role'=>    ['required', Rule::in(['superadmin', 'admin', 'logisticsII'])],
            ],[
                'Password.min' => 'Minimum of 6 characters',
            ]
        );

        User::create([
            'name'     => $credentials['Name'],
            'email'    => $credentials['Email'],
            'password' => $credentials['Password'],
            'role'     => $credentials['Role'],
        ]);

        return response()->json(['Success' => 'User created!'], 201);
    }

    public function loginView(){
        return Inertia::render('login');
    }

    public function login(Request $request){
        $credentials = $request->validate([
            'Email'=>   ['required', 'email'],
            'Password'=>    ['required', 'string', 'min:6'],
        ], [
            'Password.min' => 'Minimum of 6 characters',
        ]);

        $authCredentials = [
            'email' => $credentials['Email'],
            'password' => $credentials['Password'],
        ];
        
        if(Auth::attempt($authCredentials, false)){
            $token = $request->user()->createToken('Personal Access Token')->accessToken;
            
            return response()->json(['token'=>$token]);
        }
        
        return response()->json(['Unauthorized'=>'Wrong email or password!'], 401);
    }

    public function testPage(Request $request){
        return Inertia::render('test');
    }

}
