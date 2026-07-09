<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\ApprovalDecision;
use App\Enums\Priority;

class ResearchScreening extends Model
{
    protected $fillable = [
        'research_idea_id',
        'evaluated_by',
        'strategic_alignment_score',
        'strategic_alignment_comment',
        'feasibility_score',
        'feasibility_comment',
        'governance_impact_score',
        'governance_impact_comment',
        'resource_requirement_score',
        'resource_requirement_comment',
        'innovation_level_score',
        'innovation_level_comment',
        'risk_level_score',
        'risk_level_comment',
        'total_score',
        'calculated_priority',
        'decision',
        'overall_comment',
    ];

    protected $casts = [
        'decision' => ApprovalDecision::class,
        'calculated_priority' => Priority::class,
    ];

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($screening) {
            $screening->total_score = 
                $screening->strategic_alignment_score +
                $screening->feasibility_score +
                $screening->governance_impact_score +
                $screening->resource_requirement_score +
                $screening->innovation_level_score +
                $screening->risk_level_score;

            $screening->calculated_priority = Priority::fromScore($screening->total_score);
        });
    }

    public function researchIdea()
    {
        return $this->belongsTo(ResearchIdea::class);
    }

    public function evaluator()
    {
        return $this->belongsTo(User::class, 'evaluated_by');
    }
}
