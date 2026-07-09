<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hearing extends Model
{
    use HasFactory;

    protected $fillable = [
        'case_id',
        'hearing_type',
        'scheduled_at',
        'location',
        'meeting_link',
        'duration_minutes',
        'professional_id',
        'committee_members',
        'professional_representative',
        'witnesses',
        'status',
        'agenda',
        'minutes',
        'documents',
        'evidence_presented',
        'decision',
        'recommendations',
        'completed_at',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
        'committee_members' => 'array',
        'witnesses' => 'array',
        'documents' => 'array',
        'evidence_presented' => 'array',
        'recommendations' => 'array',
        'duration_minutes' => 'integer',
    ];

    public function case()
    {
        return $this->belongsTo(DisciplinaryCase::class, 'case_id');
    }

    public function professional()
    {
        return $this->belongsTo(User::class, 'professional_id');
    }
}
