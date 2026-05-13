<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DuplicationCase extends Model
{
    protected $fillable = [
        'title',
        'systems',
        'similarity_score',
        'status',
        'recommendation',
    ];

    protected $casts = [
        'systems' => 'array',
        'similarity_score' => 'decimal:2',
    ];
}
