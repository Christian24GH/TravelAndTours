<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'department',
        'position',
        'email',
        'phone',
        'address',
        'birthday',
        'civil_status',
        'emergency_contact',
        'hire_date',
        'manager',
        'employee_status',
        'profile_photo_url',
    ];
}