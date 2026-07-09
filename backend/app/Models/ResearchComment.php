<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResearchComment extends Model
{
    protected $fillable = [
        'commentable_type',
        'commentable_id',
        'comment',
        'user_id',
        'parent_id',
    ];

    public function commentable()
    {
        return $this->morphTo();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parent()
    {
        return $this->belongsTo(ResearchComment::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(ResearchComment::class, 'parent_id');
    }
}
