<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\Priority;

class ResearchTask extends Model
{
    protected $fillable = [
        'research_project_id',
        'research_milestone_id',
        'title',
        'description',
        'priority',
        'status',
        'due_date',
        'completed_at',
        'assigned_to',
        'estimated_hours',
        'actual_hours',
    ];

    protected $casts = [
        'priority' => Priority::class,
        'due_date' => 'date',
        'completed_at' => 'date',
    ];

    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function milestone()
    {
        return $this->belongsTo(ResearchMilestone::class, 'research_milestone_id');
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function timeLogs()
    {
        return $this->hasMany(ResearchTimeLog::class);
    }

    public function comments()
    {
        return $this->morphMany(ResearchComment::class, 'commentable');
    }
}
