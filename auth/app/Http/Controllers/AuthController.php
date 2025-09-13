<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\EmployeeSelfService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request){
        $validator = Validator::make($request->all(), [
            'name'      => ['required', 'min:2'],
            'email'     => ['required', 'email', 'unique:users,email'],
            'password'  => ['required', 'string', 'min:6'],
            'role'      => ['required', Rule::in(['Super Admin', 'LogisticsII Admin', 'Driver', 'Employee', 'LogisticsI Admin', 'HR1', 'HR2 Admin'])]
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            \DB::beginTransaction();

            $user = User::create([
                'name'     => $request->name,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => $request->role ?? 'Guest',
            ]);

            $employee = EmployeeSelfService::create([
                'first_name' => explode(' ', $user->name, 2)[0] ?? '',
                'last_name' => explode(' ', $user->name, 2)[1] ?? '',
                'email' => $user->email,
                'department' => 'Not Assigned',
                'position' => 'Not Assigned',
                'hire_date' => now()->toDateString(),
            ]);

            $user->employee_id = $employee->id;
            $user->save();

            \DB::commit();
        } catch(Exception $e) {
            \DB::rollBack();
            return response()->json('Registration Failed: ' . $e->getMessage(), 500);
        }

        return response()->json([
            'message' => 'Registered Successfully',
            'id' => $user->employee_id,
            'email' => $user->email,
        ], 200);
    }
    
    private function generateEmployeeId()
    {
        do {
            $id = mt_rand(1000, 9999);
        } while (User::where('employee_id', $id)->exists());
        
        return $id;
    }

    public function login(Request $request){
        $validated = (object)$request->validate([
            'email'     => ['required', 'email', 'exists:users,email'],
            'password'  => ['required', 'min:6'],
            'device_name' => 'sometimes|string', // Token based only
        ]);

        $user = User::where('email', $validated->email)->first();

        if (!$user || !Hash::check($validated->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        
        /*
        Auth::login($user);
        // Revoke old tokens if you want single login
        $user->tokens()->delete();

        $request->session()->regenerate();
        */

        /**Switched to Token Based */
        $device = $data['device_name'] ?? $request->header('User-Agent') ?? 'spa';
        $token = $user->createToken($device)->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            //'user'   => Auth::user()
            'token' => $token,
            'user'  => $user,
        ], 200);

    }
    
    public function otp(Request $request){
    }

    public function user(Request $request){
        //return $request->user();
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        /* SESSION BASED
        Auth::guard('web')->logout(); // log out the user

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully'
        ], 200);
        */

        // Token Based
        // if bearer token present, revoke current access token
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }

        // optionally revoke all tokens:
        // $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out']);
    
    }
}