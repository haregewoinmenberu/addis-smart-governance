<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeasibilityStudy extends Model
{
    protected $fillable = [
        'title',
        'office',
        'status',
        'score',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'date',
        'score' => 'integer',
    ];
}
