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
        'sub_city_id',
        'submitted_at',
    ];

    protected $casts = [
        'status' => IdeaStatus::class,
        'priority' => Priority::class,
        'research_category' => ResearchCategory::class,
        'submitted_at' => 'datetime',
    ];

    public function submitter()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function subCity()
    {
        return $this->belongsTo(SubCity::class);
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
