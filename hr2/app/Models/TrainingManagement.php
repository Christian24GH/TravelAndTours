<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingManagement extends Model
{
    use HasFactory;

    protected $table = 'training_management';

    protected $fillable = [
        'employee_id',
        'program_name',
        'provider',
        'duration',
        'target_skills',
        'status',
        'feedback_score',
    ];

    protected $casts = [
        'feedback_score' => 'integer',
    ];
}
