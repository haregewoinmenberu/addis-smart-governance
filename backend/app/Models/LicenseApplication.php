<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\ApplicationStatus;

class LicenseApplication extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'application_number',
        'applicant_id',
        'profession_id',
        'specialization_id',
        'full_name',
        'date_of_birth',
        'gender',
        'national_id',
        'passport_number',
        'email',
        'phone',
        'address',
        'city',
        'region',
        'country',
        'postal_code',
        'qualification_level',
        'educational_institution',
        'graduation_year',
        'experience_years',
        'previous_license_number',
        'previous_license_country',
        'status',
        'reviewed_by',
        'review_comments',
        'submitted_at',
        'approved_at',
        'rejected_at',
    ];

    protected $casts = [
        'status' => ApplicationStatus::class,
        'date_of_birth' => 'date',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'experience_years' => 'integer',
        'graduation_year' => 'integer',
    ];

    public function applicant()
    {
        return $this->belongsTo(User::class, 'applicant_id');
    }

    public function profession()
    {
        return $this->belongsTo(Profession::class);
    }

    public function specialization()
    {
        return $this->belongsTo(Specialization::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function documents()
    {
        return $this->hasMany(ProfessionalDocument::class, 'application_id');
    }

    public function educationRecords()
    {
        return $this->hasMany(EducationalRecord::class, 'application_id');
    }

    public function experienceRecords()
    {
        return $this->hasMany(ExperienceRecord::class, 'application_id');
    }

    public function verificationRequests()
    {
        return $this->hasMany(VerificationRequest::class, 'application_id');
    }

    public function examAttempts()
    {
        return $this->hasMany(ExamAttempt::class, 'application_id');
    }

    public function license()
    {
        return $this->hasOne(License::class, 'application_id');
    }

    public function workflowHistory()
    {
        return $this->morphMany(LicensingWorkflowHistory::class, 'entity');
    }

    public function auditLogs()
    {
        return $this->morphMany(LicensingAuditLog::class, 'auditable');
    }

    // Helper methods
    public function canSubmit(): bool
    {
        return $this->status === ApplicationStatus::DRAFT;
    }

    public function canApprove(): bool
    {
        return $this->status === ApplicationStatus::UNDER_REVIEW;
    }

    public function isComplete(): bool
    {
        return $this->documents()->where('is_verified', true)->count() >= 3 &&
               $this->educationRecords()->count() >= 1;
    }
}
