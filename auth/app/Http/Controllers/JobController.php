<?php

namespace App\Http\Controllers;

use App\Models\JobPosting;

class JobPostingController extends Controller
{
    public function index()
    {
        return JobPosting::all();
    }
}
