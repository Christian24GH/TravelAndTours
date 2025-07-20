<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PageController extends Controller
{
    public function login(Request $request){

        return Inertia::render('Login', [
            'url' => route('register'),
            'api_login' => route('api_login'),
            'redirect_url' => $request->input('redirect_url') ?? ''
        ]);

    }

    public function register(Request $request){

        return Inertia::render('Register', [
            'url' => route('login'),
            'api_register' => route('api_register'),
            'redirect_url' => $request->input('redirect_url') ?? ''
        ]);

    }
}
