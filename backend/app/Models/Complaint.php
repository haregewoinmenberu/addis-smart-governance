<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\ComplaintStatus;
use App\Enums\ViolationType;

class Complaint extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'complaint_number',
        'professional_id',
        'license_id',
        'filed_by',
        'complainant_name',
        'complainant_email',
        'complainant_phone',
        'is_anonymous',
        'violation_type',
        'severity',
        'description',
        'incident_date',
        'incident_location',
        'witnesses',
        'evidence_files',
        'status',
        'assigned_investigator',
        'investigation_started_at',
        'investigation_completed_at',
        'investigation_summary',
    ];

    protected $casts = [
        'violation_type' => ViolationType::class,
        'status' => ComplaintStatus::class,
        'is_anonymous' => 'boolean',
        'incident_date' => 'date',
        'witnesses' => 'array',
        'evidence_files' => 'array',
        'investigation_started_at' => 'datetime',
        'investigation_completed_at' => 'datetime',
    ];

    public function professional()
    {
        return $this->belongsTo(User::class, 'professional_id');
    }

    public function license()
    {
        return $this->belongsTo(License::class, 'license_id');
    }

    public function complainant()
    {
        return $this->belongsTo(User::class, 'filed_by');
    }

    public function investigator()
    {
        return $this->belongsTo(User::class, 'assigned_investigator');
    }

    public function disciplinaryCase()
    {
        return $this->hasOne(DisciplinaryCase::class, 'complaint_id');
    }

    public function workflowHistory()
    {
        return $this->morphMany(LicensingWorkflowHistory::class, 'entity');
    }
}
