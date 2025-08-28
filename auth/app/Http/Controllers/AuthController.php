<?php

namespace App\Http\Controllers;

use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validated = (object)$request->validate([
            'name'      => ['required', 'min:6'],
            'email'     => ['required', 'email', 'unique:users,email'],
            'password'  => ['required', 'min:6'],
            'role'      => ['required', Rule::in(['Super Admin', 'LogisticsII Admin', 'Driver', 'Employee', 'HR1 Admin'])],
        ]);

        try {
            User::create([
                'name'     => $validated->name,
                'email'    => $validated->email,
                'password' => $validated->password, // ✅ hash password
                'role'     => $validated->role,
            ]);
        } catch (Exception $e) {
            return response()->json('Registration Failed' . $e, 500);
        }

        return response()->json('Registered Successfully', 200);
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $validated = (object)$request->validate([
            'email'     => ['required', 'email:rfc,dns', 'exists:users,email'],
            'password'  => ['required', 'min:6'],
        ]);

        $user = User::where('email', $validated->email)->first();

        // ✅ check password with hash
        if (!$user || $validated->password != $user->password) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        Auth::login($user);

        // Revoke old tokens if you want single login
        $user->tokens()->delete();

        // regenerate session to prevent fixation
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Login successful',
            'user'   => Auth::user()
        ], 200);

    }
    
    public function otp(Request $request){

    }

    public function user(Request $request){
        return $request->user();
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout(); // log out the user

        // invalidate the session
        $request->session()->invalidate();

        // regenerate CSRF token avoid misuse
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully'
        ], 200);
    }
}