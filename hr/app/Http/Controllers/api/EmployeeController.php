<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    // GET /api/employees
    public function index()
    {
        return Employee::all();
    }

    // GET /api/employees/{id}
    public function show($id)
    {
        return Employee::findOrFail($id);
    }

    // You can add store, update, delete methods as needed
}