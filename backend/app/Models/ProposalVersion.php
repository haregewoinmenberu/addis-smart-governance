<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProposalVersion extends Model
{
    protected $fillable = [
        'research_project_id',
        'version_number',
        'background',
        'objectives',
        'methodology',
        'expected_deliverables',
        'estimated_budget',
        'required_resources',
        'timeline',
        'risk_analysis',
        'success_metrics',
        'change_summary',
        'created_by',
        'is_current',
    ];

    protected $casts = [
        'estimated_budget' => 'decimal:2',
        'is_current' => 'boolean',
    ];

    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reviews()
    {
        return $this->hasMany(ProposalReview::class);
    }
}
