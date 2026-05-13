<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    protected $fillable = [
        'name',
        'status',
        'score',
        'active_projects',
        'sla_breaches',
        'last_reviewed_at',
    ];

    protected $casts = [
        'last_reviewed_at' => 'date',
        'score' => 'integer',
        'active_projects' => 'integer',
        'sla_breaches' => 'integer',
    ];
}
