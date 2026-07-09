<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sanction extends Model
{
    use HasFactory;

    protected $fillable = [
        'disciplinary_action_id',
        'professional_id',
        'license_id',
        'sanction_type',
        'sanction_details',
        'start_date',
        'end_date',
        'is_indefinite',
        'terms_and_conditions',
        'reinstatement_conditions',
        'reinstatement_fee',
        'status',
        'lifted_at',
        'lifted_by',
        'lift_reason',
        'is_public_record',
        'public_notice_date',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'public_notice_date' => 'date',
        'lifted_at' => 'datetime',
        'is_indefinite' => 'boolean',
        'is_public_record' => 'boolean',
        'reinstatement_fee' => 'decimal:2',
    ];

    public function disciplinaryAction()
    {
        return $this->belongsTo(DisciplinaryAction::class, 'disciplinary_action_id');
    }

    public function professional()
    {
        return $this->belongsTo(User::class, 'professional_id');
    }

    public function license()
    {
        return $this->belongsTo(License::class, 'license_id');
    }

    public function liftedBy()
    {
        return $this->belongsTo(User::class, 'lifted_by');
    }
}
