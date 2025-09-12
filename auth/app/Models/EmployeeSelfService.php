<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeSelfService extends Model
{
    use HasFactory;

    protected $table = 'employee_self_service';

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
        'roles',
    ];
}

class LeaveRequest extends Model
{
    protected $fillable = [
        'employee_id', 'type', 'start', 'end', 'reason', 'status'
    ];

    public function employee() {
        return $this->belongsTo(Employee::class);
    }
}
