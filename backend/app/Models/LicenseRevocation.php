<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LicenseRevocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'license_id',
        'professional_id',
        'disciplinary_case_id',
        'revocation_type',
        'reason',
        'legal_basis',
        'revocation_date',
        'effective_date',
        'revoked_by',
        'authority_info',
        'committee_decision',
        'committee_members',
        'supporting_documents',
        'can_reapply',
        'earliest_reapplication_date',
        'reapplication_conditions',
        'recovery_requirements',
        'appeal_filed',
        'appeal_deadline',
        'appeal_id',
        'appeal_status',
        'is_public_record',
        'public_notice_date',
        'public_notice_content',
        'status',
    ];

    protected $casts = [
        'revocation_date' => 'date',
        'effective_date' => 'date',
        'earliest_reapplication_date' => 'date',
        'appeal_deadline' => 'date',
        'public_notice_date' => 'date',
        'committee_members' => 'array',
        'supporting_documents' => 'array',
        'can_reapply' => 'boolean',
        'appeal_filed' => 'boolean',
        'is_public_record' => 'boolean',
    ];

    public function license()
    {
        return $this->belongsTo(License::class, 'license_id');
    }

    public function professional()
    {
        return $this->belongsTo(User::class, 'professional_id');
    }

    public function disciplinaryCase()
    {
        return $this->belongsTo(DisciplinaryCase::class, 'disciplinary_case_id');
    }

    public function revoker()
    {
        return $this->belongsTo(User::class, 'revoked_by');
    }

    public function appeal()
    {
        return $this->belongsTo(Appeal::class, 'appeal_id')->withDefault();
    }

    public function appeals()
    {
        return $this->morphMany(Appeal::class, 'appealable');
    }
}
