<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Technology extends Model
{
    protected $fillable = [
        'name',
        'category',
        'owner_office',
        'status',
        'classification',
        'location',
        'deployed_at',
    ];

    protected $casts = [
        'deployed_at' => 'date',
    ];
}
