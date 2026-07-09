<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DisciplinaryCase extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'case_number',
        'complaint_id',
        'professional_id',
        'license_id',
        'case_type',
        'case_summary',
        'violations',
        'status',
        'lead_investigator',
        'investigation_team',
        'investigation_findings',
        'evidence_collected',
        'investigation_completed_at',
        'committee_members',
        'hearing_scheduled_at',
        'hearing_minutes',
        'decision_date',
        'committee_decision',
        'is_resolved',
        'resolved_at',
        'resolution_summary',
    ];

    protected $casts = [
        'violations' => 'array',
        'investigation_team' => 'array',
        'evidence_collected' => 'array',
        'committee_members' => 'array',
        'investigation_completed_at' => 'datetime',
        'hearing_scheduled_at' => 'datetime',
        'decision_date' => 'datetime',
        'resolved_at' => 'datetime',
        'is_resolved' => 'boolean',
    ];

    public function complaint()
    {
        return $this->belongsTo(Complaint::class, 'complaint_id');
    }

    public function professional()
    {
        return $this->belongsTo(User::class, 'professional_id');
    }

    public function license()
    {
        return $this->belongsTo(License::class, 'license_id');
    }

    public function leadInvestigator()
    {
        return $this->belongsTo(User::class, 'lead_investigator');
    }

    public function hearings()
    {
        return $this->hasMany(Hearing::class, 'case_id');
    }

    public function disciplinaryActions()
    {
        return $this->hasMany(DisciplinaryAction::class, 'case_id');
    }

    public function workflowHistory()
    {
        return $this->morphMany(LicensingWorkflowHistory::class, 'entity');
    }
}
