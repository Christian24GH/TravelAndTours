<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SuccessionPlanning extends Model
{
    use HasFactory;

    protected $table = 'succession_planning';

    protected $fillable = [
        'role_id',
        'employee_id',
        'readiness_level',
        'development_plan',
        'timeline_for_readiness',
    ];
}
