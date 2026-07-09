<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\ApprovalDecision;

class ProposalReview extends Model
{
    protected $fillable = [
        'research_project_id',
        'proposal_version_id',
        'review_type',
        'reviewer_id',
        'decision',
        'comment',
        'reviewed_at',
    ];

    protected $casts = [
        'decision' => ApprovalDecision::class,
        'reviewed_at' => 'datetime',
    ];

    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function proposalVersion()
    {
        return $this->belongsTo(ProposalVersion::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
