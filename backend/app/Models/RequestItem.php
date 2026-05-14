<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RequestItem extends Model
{
    protected $fillable = [
        'workflow_instance_id',
        'submitted_by',
        'code',
        'title',
        'category',
        'office',
        'status',
        'step',
        'total_steps',
        'budget',
        'submitted_at',
        'priority',
        'description',
        'justification',
        'documents',
        'approval_status',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'budget' => 'decimal:2',
        'documents' => 'array',
    ];

    /**
     * Get the workflow instance for this request.
     */
    public function workflowInstance(): BelongsTo
    {
        return $this->belongsTo(WorkflowInstance::class);
    }

    /**
     * Get the user who submitted this request.
     */
    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    /**
     * Get the duplication analysis for this request.
     */
    public function duplicationCase(): HasOne
    {
        return $this->hasOne(DuplicationCase::class);
    }

    /**
     * Get the feasibility study for this request.
     */
    public function feasibilityStudy(): HasOne
    {
        return $this->hasOne(FeasibilityStudy::class);
    }

    /**
     * Get all activity logs for this request.
     */
    public function activityLogs()
    {
        return $this->morphMany(ActivityLog::class, 'subject');
    }

    /**
     * Check if request belongs to user.
     */
    public function belongsToUser(User $user): bool
    {
        return $this->submitted_by === $user->id;
    }

    /**
     * Check if request belongs to user's sub-city.
     */
    public function belongsToSubCity(string $subCity): bool
    {
        return $this->office === $subCity;
    }
}
        'submitted_at' => 'date',
        'budget' => 'decimal:2',
        'step' => 'integer',
        'total_steps' => 'integer',
    ];
}
