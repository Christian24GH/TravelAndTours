<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompetencyManagement extends Model
{
    use HasFactory;

    protected $table = 'competency_management';

    protected $fillable = [
        'employee_id',
        'role_id',
        'role_name',
        'competency_id',
        'competency_name',
        'competency_type',
        'competency_level',
        'last_assessed_date',
    ];

    protected $casts = [
        'last_assessed_date' => 'date',
    ];
}
