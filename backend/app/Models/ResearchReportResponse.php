<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResearchReportResponse extends Model
{
    protected $fillable = [
        'research_idea_id',
        'workflow_progress_id',
        'responded_by',
        'response_type',
        'certificate_path',
        'certificate_name',
        'message',
        'forwarded_to_user_id',
        'notification_id',
        'sent_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    public function researchIdea()
    {
        return $this->belongsTo(ResearchIdea::class);
    }

    public function workflowProgress()
    {
        return $this->belongsTo(ResearchWorkflowProgress::class, 'workflow_progress_id');
    }

    public function respondedBy()
    {
        return $this->belongsTo(User::class, 'responded_by');
    }

    public function forwardedTo()
    {
        return $this->belongsTo(User::class, 'forwarded_to_user_id');
    }

    public function notification()
    {
        return $this->belongsTo(Notification::class, 'notification_id');
    }

    public function scopeRequesterResponses($query)
    {
        return $query->where('response_type', 'requester');
    }

    public function scopeForwards($query)
    {
        return $query->where('response_type', 'forward');
    }

    /**
     * Whether the recipient has not yet opened the notification for this
     * response/forward — the trigger for showing a Resend action.
     */
    public function getReachedAttribute(): bool
    {
        return $this->notification?->read_at !== null;
    }
}
