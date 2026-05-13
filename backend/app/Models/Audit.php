<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Audit extends Model
{
    protected $fillable = [
        'title',
        'office',
        'status',
        'score',
        'due_date',
        'started_at',
    ];

    protected $casts = [
        'due_date' => 'date',
        'started_at' => 'date',
        'score' => 'integer',
    ];
}
