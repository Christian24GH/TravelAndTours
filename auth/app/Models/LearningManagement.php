<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LearningManagement extends Model
{
    use HasFactory;

    protected $table = 'learning_management';

    protected $fillable = [
        'employee_id',
        'title',
        'description',
        'status',
        'progress',
        'due_date',
        'file_path',
        'quiz',
        'quiz_answers',
        'quiz_score',
        'completion_date',
    ];

    protected $casts = [
        'quiz' => 'array',
        'quiz_answers' => 'array',
        'due_date' => 'datetime',
        'completion_date' => 'date',
    ];
}
