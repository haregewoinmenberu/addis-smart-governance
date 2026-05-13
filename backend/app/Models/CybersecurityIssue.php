<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CybersecurityIssue extends Model
{
    protected $fillable = [
        'title',
        'system',
        'severity',
        'status',
        'detected_at',
        'resolved_at',
    ];

    protected $casts = [
        'detected_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];
}
