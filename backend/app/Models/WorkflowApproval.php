<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowApproval extends Model
{
    protected $fillable = [
        'workflow_instance_id',
        'stage_name',
        'stage_index',
        'approver_id',
        'action',
        'comments',
        'metadata',
        'actioned_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'actioned_at' => 'datetime',
    ];

    /**
     * Get the workflow instance.
     */
    public function workflowInstance(): BelongsTo
    {
        return $this->belongsTo(WorkflowInstance::class);
    }

    /**
     * Get the approver.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    /**
     * Check if approval is pending.
     */
    public function isPending(): bool
    {
        return $this->action === 'pending';
    }

    /**
     * Check if approval is approved.
     */
    public function isApproved(): bool
    {
        return $this->action === 'approved';
    }

    /**
     * Check if approval is rejected.
     */
    public function isRejected(): bool
    {
        return $this->action === 'rejected';
    }
}
