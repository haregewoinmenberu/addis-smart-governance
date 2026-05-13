<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'title',
        'message',
        'channel',
        'priority',
        'recipient',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];
}
