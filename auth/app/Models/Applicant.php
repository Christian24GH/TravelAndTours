<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Applicant extends Model
{
    use HasFactory;

    protected $fillable = [
    'employee_code', 'name', 'email', 'phone', 'status', 'hire_date',
    'job', 'job_title', 'employment_type', 'department', 'salary',
    'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_address'
];

}
