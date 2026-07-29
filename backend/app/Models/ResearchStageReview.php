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
