<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Employee;
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
            'password'  => ['required', 'min:8', 'confirmed'],
            'role'      => ['sometimes', Rule::in(['Super Admin', 'LogisticsII Admin', 'Driver', 'Employee', 'HR1', 'HR2 Admin', 'Guest'])],
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

            $employee = Employee::create([
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
            'email'     => ['required', 'email:rfs,dns', 'exists:users,email'],
            'password'  => ['required', 'min:6'],
        ]);

        $user = User::where('email', $validated->email)->first();

        if (!$user || !Hash::check($validated->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        Auth::login($user);

        $user->tokens()->delete();

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
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully'
        ], 200);
    }
}