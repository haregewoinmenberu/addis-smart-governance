<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Survey extends Model
{
    protected $fillable = [
        'title',
        'responses',
        'sentiment',
        'status',
        'created_by',
    ];

    protected $casts = [
        'responses' => 'integer',
    ];
}
