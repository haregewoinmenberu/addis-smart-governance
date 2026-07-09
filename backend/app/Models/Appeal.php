<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appeal extends Model
{
    use HasFactory;

    protected $fillable = [
        'appeal_number',
        'professional_id',
        'appealable_type',
        'appealable_id',
        'grounds_for_appeal',
        'arguments',
        'supporting_documents',
        'witnesses',
        'filed_date',
        'deadline_date',
        'status',
        'appeal_board_members',
        'assigned_reviewer',
        'review_started_at',
        'hearing_date',
        'hearing_location',
        'hearing_minutes',
        'decision',
        'decision_rationale',
        'new_terms',
        'decision_date',
        'decided_by',
        'further_appeal_allowed',
        'further_appeal_authority',
    ];

    protected $casts = [
        'supporting_documents' => 'array',
        'witnesses' => 'array',
        'appeal_board_members' => 'array',
        'new_terms' => 'array',
        'filed_date' => 'date',
        'deadline_date' => 'date',
        'review_started_at' => 'datetime',
        'hearing_date' => 'datetime',
        'decision_date' => 'datetime',
        'further_appeal_allowed' => 'boolean',
    ];

    public function professional()
    {
        return $this->belongsTo(User::class, 'professional_id');
    }

    public function appealable()
    {
        return $this->morphTo();
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'assigned_reviewer');
    }

    public function decider()
    {
        return $this->belongsTo(User::class, 'decided_by');
    }
}
