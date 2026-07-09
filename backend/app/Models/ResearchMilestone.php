<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResearchMilestone extends Model
{
    protected $fillable = [
        'research_project_id',
        'title',
        'description',
        'planned_start_date',
        'planned_end_date',
        'actual_start_date',
        'actual_end_date',
        'progress_percentage',
        'status',
        'deliverables',
        'assigned_to',
        'order',
    ];

    protected $casts = [
        'planned_start_date' => 'date',
        'planned_end_date' => 'date',
        'actual_start_date' => 'date',
        'actual_end_date' => 'date',
    ];

    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function tasks()
    {
        return $this->hasMany(ResearchTask::class);
    }

    public function comments()
    {
        return $this->morphMany(ResearchComment::class, 'commentable');
    }
}
