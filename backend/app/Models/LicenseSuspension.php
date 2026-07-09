<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LicenseSuspension extends Model
{
    use HasFactory;

    protected $fillable = [
        'license_id',
        'professional_id',
        'disciplinary_action_id',
        'suspension_type',
        'reason',
        'start_date',
        'scheduled_end_date',
        'actual_end_date',
        'duration_days',
        'suspended_by',
        'authority_info',
        'legal_basis',
        'reinstatement_conditions',
        'is_reinstated',
        'reinstated_at',
        'reinstated_by',
        'reinstatement_notes',
        'status',
        'professional_notified',
        'notified_at',
        'public_posted',
        'posted_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'scheduled_end_date' => 'date',
        'actual_end_date' => 'date',
        'reinstated_at' => 'datetime',
        'notified_at' => 'datetime',
        'posted_at' => 'datetime',
        'is_reinstated' => 'boolean',
        'professional_notified' => 'boolean',
        'public_posted' => 'boolean',
        'duration_days' => 'integer',
    ];

    public function license()
    {
        return $this->belongsTo(License::class, 'license_id');
    }

    public function professional()
    {
        return $this->belongsTo(User::class, 'professional_id');
    }

    public function disciplinaryAction()
    {
        return $this->belongsTo(DisciplinaryAction::class, 'disciplinary_action_id');
    }

    public function suspendedBy()
    {
        return $this->belongsTo(User::class, 'suspended_by');
    }

    public function reinstatedBy()
    {
        return $this->belongsTo(User::class, 'reinstated_by');
    }
}
