<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class WorkflowInstance extends Model
{
    protected $fillable = [
        'workflow_definition_id',
        'workflowable_type',
        'workflowable_id',
        'current_stage',
        'current_stage_index',
        'status',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the workflow definition.
     */
    public function definition(): BelongsTo
    {
        return $this->belongsTo(WorkflowDefinition::class, 'workflow_definition_id');
    }

    /**
     * Get the entity this workflow is attached to.
     */
    public function workflowable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get all approvals for this workflow.
     */
    public function approvals(): HasMany
    {
        return $this->hasMany(WorkflowApproval::class);
    }

    /**
     * Get the current stage approval.
     */
    public function currentApproval()
    {
        return $this->approvals()
            ->where('stage_name', $this->current_stage)
            ->latest()
            ->first();
    }

    /**
     * Advance to next stage.
     */
    public function advanceToNextStage(): bool
    {
        $nextStage = $this->definition->getNextStage($this->current_stage);
        
        if (!$nextStage) {
            $this->complete();
            return false;
        }

        $this->update([
            'current_stage' => $nextStage['name'],
            'current_stage_index' => $nextStage['order'] - 1,
        ]);

        // Create approval record for next stage
        $this->approvals()->create([
            'stage_name' => $nextStage['name'],
            'stage_index' => $nextStage['order'] - 1,
            'action' => 'pending',
        ]);

        return true;
    }

    /**
     * Mark workflow as completed.
     */
    public function complete(): void
    {
        $this->update([
            'status' => 'approved',
            'completed_at' => now(),
        ]);
    }

    /**
     * Reject workflow.
     */
    public function reject(): void
    {
        $this->update([
            'status' => 'rejected',
            'completed_at' => now(),
        ]);
    }

    /**
     * Request revision.
     */
    public function requestRevision(): void
    {
        $this->update([
            'status' => 'revision_requested',
        ]);
    }

    /**
     * Check if workflow is completed.
     */
    public function isCompleted(): bool
    {
        return !is_null($this->completed_at);
    }

    /**
     * Check if workflow is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending' || $this->status === 'in_progress';
    }
}
