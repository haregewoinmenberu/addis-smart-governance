<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Experiment extends Model
{
    protected $fillable = [
        'research_project_id',
        'experiment_code',
        'title',
        'hypothesis',
        'methodology',
        'conducted_date',
        'results',
        'conclusion',
        'observations',
        'status',
        'conducted_by',
    ];

    protected $casts = [
        'conducted_date' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($experiment) {
            if (!$experiment->experiment_code) {
                $experiment->experiment_code = 'EXP-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));
            }
        });
    }

    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function conductor()
    {
        return $this->belongsTo(User::class, 'conducted_by');
    }

    public function comments()
    {
        return $this->morphMany(ResearchComment::class, 'commentable');
    }
}
