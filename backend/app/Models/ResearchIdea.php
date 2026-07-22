<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\IdeaStatus;
use App\Enums\Priority;
use App\Enums\ResearchCategory;

class ResearchIdea extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'summary',
        'problem_statement',
        'objectives',
        'expected_outcome',
        'research_category',
        'government_sector',
        'priority',
        'status',
        'submitted_by',
        'submitted_at',
        'assigned_to_smart_city',
        'smart_city_assigned_at',
        'smart_city_notes',
        'assigned_to_director',
        'director_assigned_at',
        'director_notes',
        'assignment_status',
    ];

    protected $casts = [
        'status' => IdeaStatus::class,
        'priority' => Priority::class,
        'research_category' => ResearchCategory::class,
        'submitted_at' => 'datetime',
        'smart_city_assigned_at' => 'datetime',
        'director_assigned_at' => 'datetime',
    ];

    protected $appends = ['assigned_director_name'];

    public function getAssignedDirectorNameAttribute()
    {
        return $this->assignedToDirector?->name;
    }

    public function submitter()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function assignedToSmartCity()
    {
        return $this->belongsTo(User::class, 'assigned_to_smart_city');
    }

    public function assignedToDirector()
    {
        return $this->belongsTo(User::class, 'assigned_to_director');
    }

    public function attachments()
    {
        return $this->hasMany(ResearchIdeaAttachment::class);
    }

    public function screenings()
    {
        return $this->hasMany(ResearchScreening::class);
    }

    public function project()
    {
        return $this->hasOne(ResearchProject::class);
    }

    public function activityLogs()
    {
        return $this->morphMany(ResearchActivityLog::class, 'entity');
    }
}
