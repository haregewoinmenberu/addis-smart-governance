<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResearchStageReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'workflow_progress_id',
        'reviewed_by',
        'decision',
        'review_comments',
        'review_data',
        'reviewed_at',
    ];

    protected $casts = [
        'review_data' => 'array',
        'reviewed_at' => 'datetime',
    ];

    public function workflowProgress()
    {
        return $this->belongsTo(ResearchWorkflowProgress::class, 'workflow_progress_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Maps the "Evaluation Summary Report" stage's own decision field
     * (the evaluator's actual verdict) onto the parent ResearchIdea's
     * status once that report is approved as a review.
     */
    private const FINAL_DECISION_TO_IDEA_STATUS = [
        'approved_to_develop' => 'approved',
        'transfer_existing' => 'approved',
        'customization_of_existing' => 'approved',
        'infrastructure_upgrade' => 'approved',
        'approved_with_conditions' => 'approved',
        'approved_for_pilot' => 'approved',
        'approved_for_full_implementation' => 'approved',
        'approved_for_production' => 'approved',
        'rejected' => 'rejected',
        'needs_improvement' => 'needs_improvement',
        // deferred / pending / further_review_required / resubmit_with_changes:
        // no automatic transition — the idea stays under_review until resolved.
    ];

    /**
     * Apply review decision
     */
    public function applyDecision()
    {
        $progress = $this->workflowProgress;

        switch ($this->decision) {
            case 'approved':
                $progress->update([
                    'status' => 'approved',
                    'completed_at' => now(),
                    'completed_by' => $this->reviewed_by,
                ]);

                // Completing and approving the Evaluation Summary Report is
                // the actual final decision on the technology request — until
                // now, nothing propagated that outcome onto ResearchIdea.status,
                // so approving every stage never actually approved the request.
                if ($progress->stage->slug === 'evaluation_summary_report') {
                    $finalDecision = $progress->stage_data['decision'] ?? null;
                    $mappedStatus = self::FINAL_DECISION_TO_IDEA_STATUS[$finalDecision] ?? null;
                    if ($mappedStatus) {
                        $progress->researchIdea->update(['status' => $mappedStatus]);
                    }
                }
                break;

            case 'revision_requested':
                $progress->update([
                    'status' => 'revision_requested',
                    'notes' => ($progress->notes ?? '') . "\n\nRevision requested: " . $this->review_comments,
                ]);
                break;

            case 'rejected':
                $progress->update([
                    'status' => 'rejected',
                ]);
                break;
        }
    }
}
