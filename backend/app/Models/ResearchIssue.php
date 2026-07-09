<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\Priority;

class ResearchIssue extends Model
{
    protected $fillable = [
        'research_project_id',
        'title',
        'description',
        'type',
        'priority',
        'status',
        'resolution',
        'reported_by',
        'assigned_to',
        'reported_date',
        'resolved_date',
    ];

    protected $casts = [
        'priority' => Priority::class,
        'reported_date' => 'date',
        'resolved_date' => 'date',
    ];

    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function comments()
    {
        return $this->morphMany(ResearchComment::class, 'commentable');
    }
}
