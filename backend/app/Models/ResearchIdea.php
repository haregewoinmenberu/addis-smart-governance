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
        'vendor_name',
        'vendor_contact',
        'trl_level',
        'is_external_request',
        'requester_name',
        'requester_email',
        'requester_phone',
        'requester_organization',
        'smart_city_request_id',
        'reference_number',
        'intake_form_data',
    ];

    protected $casts = [
        'status' => IdeaStatus::class,
        'priority' => Priority::class,
        'research_category' => ResearchCategory::class,
        'submitted_at' => 'datetime',
        'smart_city_assigned_at' => 'datetime',
        'director_assigned_at' => 'datetime',
        'trl_level' => 'integer',
        'is_external_request' => 'boolean',
        'intake_form_data' => 'array',
    ];

    protected $appends = ['assigned_director_name', 'request_type'];

    public function getAssignedDirectorNameAttribute()
    {
        return $this->assignedToDirector?->name;
    }

    /**
     * Returns 'system_request', 'infrastructure_request', or 'security_related_request'
     * based on the category. Matches the research_workflow_stages.research_type enum
     * so it can be used directly to filter conditional evaluation stages.
     */
    public function getRequestTypeAttribute(): string
    {
        return $this->getRequestType();
    }

    public function getRequestType(): string
    {
        $category = $this->research_category;
        $value = $category instanceof \App\Enums\ResearchCategory ? $category->value : $category;

        if (is_string($value)) {
            if (str_starts_with($value, 'security_related')) {
                return 'security_related_request';
            }
            if (str_starts_with($value, 'infrastructure')) {
                return 'infrastructure_request';
            }
        }

        return 'system_request';
    }

    /**
     * Generate Technology Clearance Certificate data for approved requests.
     */
    public function getClearanceCertificate(): array
    {
        $isApproved = $this->status?->value === 'approved';

        // Get the final report stage review if available
        $finalReport = $this->workflowProgress()
            ->whereHas('stage', fn($q) => $q->where('slug', 'evaluation_summary_report'))
            ->with('reviews.reviewer')
            ->first();

        $conditions = null;
        if ($finalReport && isset($finalReport->form_data['conditions'])) {
            $conditions = $finalReport->form_data['conditions'];
        }

        $reviewedBy = $finalReport?->reviews?->first()?->reviewer?->name
            ?? $this->assignedToDirector?->name;

        $reviewedAt = $finalReport?->reviews?->first()?->reviewed_at?->toDateString()
            ?? $this->director_assigned_at?->toDateString();

        return [
            'type'                 => $isApproved ? 'clearance' : 'rejection',
            'request_title'        => $this->title,
            'requesting_org'       => $this->government_sector ?? $this->submitter?->institution?->name ?? 'Unknown',
            'evaluation_type'      => $this->getRequestType() === 'infrastructure_request' ? 'Infrastructure Request' : 'System Request',
            'category_label'       => $this->research_category?->label() ?? 'Technology Request',
            'decision'             => $isApproved ? 'Approved' : ($this->status?->value === 'rejected' ? 'Rejected' : 'Pending'),
            'conditions'           => $conditions,
            'approved_by'          => $reviewedBy,
            'decision_date'        => $reviewedAt ?? now()->toDateString(),
            'reference_number'     => 'TCR-' . str_pad($this->id, 5, '0', STR_PAD_LEFT) . '-' . date('Y'),
            'request_summary'      => $this->summary,
        ];
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

    /**
     * The SmartCityRequest this idea originated from, when submitted through
     * the unified intake front door. Unused until intake is wired in Phase 2.
     */
    public function smartCityRequest()
    {
        return $this->belongsTo(SmartCityRequest::class);
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

    public function assignments()
    {
        return $this->hasMany(ResearchAssignment::class);
    }

    public function workflowProgress()
    {
        return $this->hasMany(ResearchWorkflowProgress::class);
    }

    public function forwardRequests()
    {
        return $this->hasMany(ResearchForwardRequest::class);
    }

    public function activityLogs()
    {
        return $this->morphMany(ResearchActivityLog::class, 'entity');
    }

    /**
     * Get current team leader assignment
     */
    public function currentTeamLeader()
    {
        return $this->assignments()
            ->where('assignment_type', 'team_leader')
            ->where('status', '!=', 'completed')
            ->latest()
            ->first();
    }

    /**
     * Get current officer assignments
     */
    public function currentOfficers()
    {
        return $this->assignments()
            ->where('assignment_type', 'officer')
            ->whereIn('status', ['accepted', 'in_progress'])
            ->get();
    }

    /**
     * Get evaluation progress percentage
     */
    public function getProgressPercentage(): int
    {
        $totalStages = $this->workflowProgress()->count();
        if ($totalStages === 0) {
            return 0;
        }

        $completedStages = $this->workflowProgress()
            ->whereIn('status', ['completed', 'approved'])
            ->count();

        return (int) round(($completedStages / $totalStages) * 100);
    }
}

