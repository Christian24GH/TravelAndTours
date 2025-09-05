<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobPosting extends Model
{
    protected $table = 'job_postings';

    protected $fillable = [
        'title',
        'description',
        'location',
        'status',
    ];
}

