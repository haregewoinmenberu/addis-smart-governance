<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\DisciplinaryAction as DisciplinaryActionEnum;

class DisciplinaryAction extends Model
{
    use HasFactory;

    protected $fillable = [
        'case_id',
        'professional_id',
        'license_id',
        'action_type',
        'action_description',
        'severity_level',
        'effective_date',
        'end_date',
        'is_permanent',
        'fine_amount',
        'fine_currency',
        'fine_paid',
        'fine_paid_at',
        'training_course',
        'training_hours',
        'training_completed',
        'training_completed_at',
        'practice_restrictions',
        'suspension_terms',
        'imposed_by',
        'imposed_by_authority',
        'status',
        'implemented_at',
        'completed_at',
        'is_public',
        'public_notice',
    ];

    protected $casts = [
        'action_type' => DisciplinaryActionEnum::class,
        'effective_date' => 'date',
        'end_date' => 'date',
        'is_permanent' => 'boolean',
        'fine_amount' => 'decimal:2',
        'fine_paid' => 'boolean',
        'fine_paid_at' => 'datetime',
        'training_completed' => 'boolean',
        'training_completed_at' => 'datetime',
        'implemented_at' => 'datetime',
        'completed_at' => 'datetime',
        'is_public' => 'boolean',
        'severity_level' => 'integer',
        'training_hours' => 'integer',
    ];

    public function case()
    {
        return $this->belongsTo(DisciplinaryCase::class, 'case_id');
    }

    public function professional()
    {
        return $this->belongsTo(User::class, 'professional_id');
    }

    public function license()
    {
        return $this->belongsTo(License::class, 'license_id');
    }

    public function imposer()
    {
        return $this->belongsTo(User::class, 'imposed_by');
    }

    public function sanctions()
    {
        return $this->hasMany(Sanction::class, 'disciplinary_action_id');
    }

    public function suspensions()
    {
        return $this->hasMany(LicenseSuspension::class, 'disciplinary_action_id');
    }

    public function appeals()
    {
        return $this->morphMany(Appeal::class, 'appealable');
    }
}
