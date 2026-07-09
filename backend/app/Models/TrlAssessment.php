<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrlAssessment extends Model
{
    protected $fillable = [
        'research_project_id',
        'trl_level',
        'previous_trl_level',
        'assessment_notes',
        'evidence',
        'next_level_requirements',
        'assessed_by',
        'assessment_date',
    ];

    protected $casts = [
        'assessment_date' => 'date',
    ];

    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function assessor()
    {
        return $this->belongsTo(User::class, 'assessed_by');
    }
}
