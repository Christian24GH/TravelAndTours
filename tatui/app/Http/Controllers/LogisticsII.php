<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class logisticsII extends Controller
{
    public function index(){
        return Inertia('logistics-two');
    }
}
