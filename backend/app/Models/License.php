<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\LicenseStatus;

class License extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'license_number',
        'application_id',
        'professional_id',
        'profession_id',
        'specialization_id',
        'issue_date',
        'expiry_date',
        'status',
        'qr_code',
        'digital_signature',
        'certificate_path',
        'issued_by',
        'issuing_authority_info',
        'special_conditions',
        'practice_restrictions',
        'suspended_at',
        'revoked_at',
        'status_reason',
    ];

    protected $casts = [
        'status' => LicenseStatus::class,
        'issue_date' => 'date',
        'expiry_date' => 'date',
        'suspended_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    public function application()
    {
        return $this->belongsTo(LicenseApplication::class, 'application_id');
    }

    public function professional()
    {
        return $this->belongsTo(User::class, 'professional_id');
    }

    public function profession()
    {
        return $this->belongsTo(Profession::class);
    }

    public function specialization()
    {
        return $this->belongsTo(Specialization::class);
    }

    public function issuer()
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function renewals()
    {
        return $this->hasMany(LicenseRenewal::class, 'license_id');
    }

    public function suspensions()
    {
        return $this->hasMany(LicenseSuspension::class, 'license_id');
    }

    public function revocation()
    {
        return $this->hasOne(LicenseRevocation::class, 'license_id');
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class, 'license_id');
    }

    public function disciplinaryActions()
    {
        return $this->hasMany(DisciplinaryAction::class, 'license_id');
    }

    public function workflowHistory()
    {
        return $this->morphMany(LicensingWorkflowHistory::class, 'entity');
    }

    // Helper methods
    public function isActive(): bool
    {
        return $this->status === LicenseStatus::ACTIVE;
    }

    public function isExpired(): bool
    {
        return $this->expiry_date->isPast();
    }

    public function daysUntilExpiry(): int
    {
        return now()->diffInDays($this->expiry_date, false);
    }

    public function isEligibleForRenewal(): bool
    {
        $gracePeriod = $this->profession->renewal_grace_period_days ?? 30;
        return $this->daysUntilExpiry() <= 90 || 
               ($this->isExpired() && abs($this->daysUntilExpiry()) <= $gracePeriod);
    }
}
