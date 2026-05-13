<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Workflow extends Model
{
    protected $fillable = [
        'name',
        'stages',
        'active',
        'owner_office',
        'last_run_at',
    ];

    protected $casts = [
        'active' => 'boolean',
        'last_run_at' => 'date',
        'stages' => 'integer',
    ];
}
