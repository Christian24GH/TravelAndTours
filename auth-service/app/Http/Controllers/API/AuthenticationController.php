<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthenticationController extends Controller
{
    public function register(Request $request){

        $request->validate([
            'Name' => 'required|string|min:3',
            'Email' => 'required|email|unique:users',
            'Password' => 'required|string|min:6',
        ]);


        User::create([
            'name' => $request->Name,
            'email' => $request->Email,
            'password' => Hash::make($request->Password),
        ]);


        return response()->json(['message' => 'User registered successfully']);
    }


    
    public function login(Request $request){
        
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'errors' => $e->errors()
            ], 422);
        }


        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid Credentials'], 401);
        }
    

        $token = $request->user()->createToken('Personal Access Token')->accessToken;
        return response()->json(['token' => $token]);


    }



    public function me(Request $request){
        //dd($request);
        return response()->json($request->user());

    }



    public function logOut(Request $request){
        
        $request->user()->token()->revoke();
        return response()->json(['message' => 'Logged out successfully']);

    }


}
