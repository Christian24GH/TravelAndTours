<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class LoginController extends Controller
{
    public function index(){
        return Inertia('login');
    }
    
    public function submit(Request $request){
         $request->validate([
            'email' => ['required','email'],
            'password' => ['required'],
        ]);


        $loginApi = env('DOMAIN') . 'auth-service/public/api/login';
        $response = Http::post($loginApi, [
            'email'=>$request->email,
            'password'=>$request->password
        ]);

        if ($response->failed()) {
            return back()->withErrors(['message' => 'Invalid credentials']);
        }

        $data = $response->json();

        session(['auth_token' => $data['token']]);

        return redirect()->route('dashboard');

    }

    public function logout(Request $request){

        $token = session('auth_token');
        //dd($token);

        $logoutApi = env('DOMAIN') . 'auth-service/public/api/logout';
        $response = Http::withToken($token)->post($logoutApi);
        if ($response->ok()) {
            // Clear session properly (Laravel way)
            $request->session()->invalidate(); // Clear all session data
            $request->session()->regenerateToken(); // Prevent CSRF reuse

            return redirect()->route('login');
        }

        return back()->with('error', 'Logout failed.');
    }
}
