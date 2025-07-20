<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class CheckUser
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = session('auth_token');

        if (!$token) {
            return redirect()->route('login')->withErrors(['auth' => 'No auth token found.']);
        }

        // Check if user is already in session
        if (!session()->has('auth_user')) {
            $response = Http::withToken($token)->get('http://localhost/TravelAndTour/auth-service/public/api/me');

            if ($response->failed()) {
                return redirect()->route('login')->withErrors(['auth' => 'Failed to authenticate user.']);
            }

            $user = $response->json();

            // Store user in session
            session(['auth_user' => $user]);
        } else {
            $user = session('auth_user');
        }

        // Inject user into request for controller access
        $request->merge(['auth_user' => $user]);

        return $next($request);
    }
}
