<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestItem extends Model
{
    protected $fillable = [
        'code',
        'title',
        'office',
        'status',
        'step',
        'total_steps',
        'budget',
        'submitted_at',
        'priority',
        'description',
    ];

    protected $casts = [
        'submitted_at' => 'date',
        'budget' => 'decimal:2',
        'step' => 'integer',
        'total_steps' => 'integer',
    ];
}
