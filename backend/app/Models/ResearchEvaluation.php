<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\TRLLevel;

class ResearchEvaluation extends Model
{
    protected $fillable = [
        'research_project_id',
        'baseline_metrics',
        'performance_improvements',
        'research_findings',
        'recommendations',
        'lessons_learned',
        'trl_level',
        'trl_justification',
        'commercialization_potential',
        'scalability_assessment',
        'sustainability_assessment',
        'transfer_recommended',
        'evaluated_by',
        'evaluation_date',
    ];

    protected $casts = [
        'trl_level' => 'integer',
        'transfer_recommended' => 'boolean',
        'evaluation_date' => 'date',
    ];

    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function evaluator()
    {
        return $this->belongsTo(User::class, 'evaluated_by');
    }
}
