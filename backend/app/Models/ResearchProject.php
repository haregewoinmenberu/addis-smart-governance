<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\ResearchStage;
use App\Enums\TRLLevel;

class ResearchProject extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'project_code',
        'research_idea_id',
        'title',
        'current_stage',
        'background',
        'objectives',
        'methodology',
        'expected_deliverables',
        'estimated_budget',
        'required_resources',
        'start_date',
        'end_date',
        'risk_analysis',
        'success_metrics',
        'progress_percentage',
        'project_lead_id',
        'sub_city_id',
        'trl_level',
    ];

    protected $casts = [
        'current_stage' => ResearchStage::class,
        'start_date' => 'date',
        'end_date' => 'date',
        'estimated_budget' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($project) {
            if (!$project->project_code) {
                $project->project_code = 'RP-' . date('Y') . '-' . str_pad(static::count() + 1, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    public function researchIdea()
    {
        return $this->belongsTo(ResearchIdea::class);
    }

    public function projectLead()
    {
        return $this->belongsTo(User::class, 'project_lead_id');
    }

    public function subCity()
    {
        return $this->belongsTo(SubCity::class);
    }

    public function proposalVersions()
    {
        return $this->hasMany(ProposalVersion::class);
    }

    public function currentProposalVersion()
    {
        return $this->hasOne(ProposalVersion::class)->where('is_current', true);
    }

    public function reviews()
    {
        return $this->hasMany(ProposalReview::class);
    }

    public function milestones()
    {
        return $this->hasMany(ResearchMilestone::class);
    }

    public function tasks()
    {
        return $this->hasMany(ResearchTask::class);
    }

    public function experiments()
    {
        return $this->hasMany(Experiment::class);
    }

    public function prototypeVersions()
    {
        return $this->hasMany(PrototypeVersion::class);
    }

    public function progressReports()
    {
        return $this->hasMany(ProgressReport::class);
    }

    public function risks()
    {
        return $this->hasMany(ResearchRisk::class);
    }

    public function issues()
    {
        return $this->hasMany(ResearchIssue::class);
    }

    public function evaluations()
    {
        return $this->hasMany(ResearchEvaluation::class);
    }

    public function trlAssessments()
    {
        return $this->hasMany(TrlAssessment::class);
    }

    public function technologyTransfers()
    {
        return $this->hasMany(TechnologyTransfer::class);
    }

    public function workflowHistory()
    {
        return $this->hasMany(ResearchWorkflowHistory::class);
    }

    public function teamMembers()
    {
        return $this->hasMany(ResearchTeamMember::class);
    }

    public function documents()
    {
        return $this->hasMany(ResearchDocument::class);
    }

    public function expenses()
    {
        return $this->hasMany(ResearchExpense::class);
    }

    public function timeLogs()
    {
        return $this->hasMany(ResearchTimeLog::class);
    }

    public function comments()
    {
        return $this->morphMany(ResearchComment::class, 'commentable');
    }

    public function canTransitionTo(ResearchStage $stage): bool
    {
        return $this->current_stage->canTransitionTo($stage);
    }
}
