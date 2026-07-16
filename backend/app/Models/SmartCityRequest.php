<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class SmartCityRequest extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'request_number',
        'title',
        'description',
        'request_type',
        'source',
        'submitted_by',
        'institution_id',
        'external_requester_name',
        'external_requester_email',
        'external_requester_phone',
        'external_requester_organization',
        'assigned_to_command_center',
        'assigned_at',
        'command_center_notes',
        'classification',
        'status',
        'routed_to_type',
        'routed_to_id',
        'priority',
        'attachments',
        'metadata',
        'submitted_at',
        'completed_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'assigned_at' => 'datetime',
        'completed_at' => 'datetime',
        'attachments' => 'array',
        'metadata' => 'array',
    ];

    /**
     * Generate unique request number on creation
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->request_number)) {
                $model->request_number = 'SCR-' . date('Ymd') . '-' . str_pad(
                    static::whereDate('created_at', today())->count() + 1, 
                    4, 
                    '0', 
                    STR_PAD_LEFT
                );
            }
            
            if (empty($model->submitted_at)) {
                $model->submitted_at = now();
            }
        });
    }

    /**
     * Get the user who submitted this request.
     */
    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    /**
     * Get the institution that submitted this request.
     */
    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    /**
     * Get the Smart City Command Center assignee.
     */
    public function commandCenterAssignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_command_center');
    }

    /**
     * Get the entity this request is routed to (polymorphic).
     */
    public function routedTo(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get activity logs for this request.
     */
    public function activityLogs()
    {
        return $this->morphMany(ActivityLog::class, 'subject');
    }

    /**
     * Scope: Pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope: Requests for Smart City Command Center
     */
    public function scopeForCommandCenter($query)
    {
        return $query->whereIn('status', ['pending', 'under_review', 'classified']);
    }

    /**
     * Scope: External requests
     */
    public function scopeExternal($query)
    {
        return $query->where('source', 'external');
    }

    /**
     * Scope: Internal requests
     */
    public function scopeInternal($query)
    {
        return $query->where('source', 'internal');
    }

    /**
     * Scope: Institutional requests
     */
    public function scopeInstitutional($query)
    {
        return $query->where('source', 'institutional');
    }

    /**
     * Check if request is from external source (non-registered)
     */
    public function isExternal(): bool
    {
        return $this->source === 'external';
    }

    /**
     * Check if request is from registered institution
     */
    public function isInstitutional(): bool
    {
        return $this->source === 'institutional' && $this->institution_id !== null;
    }

    /**
     * Check if request is from internal user
     */
    public function isInternal(): bool
    {
        return $this->source === 'internal';
    }

    /**
     * Assign to Smart City Command Center
     */
    public function assignToCommandCenter(User $user): void
    {
        $this->update([
            'assigned_to_command_center' => $user->id,
            'assigned_at' => now(),
            'status' => 'under_review',
        ]);
    }

    /**
     * Classify request type
     */
    public function classify(string $classification, ?string $notes = null): void
    {
        $this->update([
            'classification' => $classification,
            'command_center_notes' => $notes,
            'status' => 'classified',
        ]);
    }

    /**
     * Route to specific workflow entity
     */
    public function routeTo($entity): void
    {
        $this->update([
            'routed_to_type' => get_class($entity),
            'routed_to_id' => $entity->id,
            'status' => 'routed',
        ]);
    }

    /**
     * Mark as in progress
     */
    public function markInProgress(): void
    {
        $this->update(['status' => 'in_progress']);
    }

    /**
     * Mark as completed
     */
    public function complete(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    /**
     * Reject request
     */
    public function reject(?string $reason = null): void
    {
        $this->update([
            'status' => 'rejected',
            'command_center_notes' => $reason,
            'completed_at' => now(),
        ]);
    }

    /**
     * Get requester name (handles all source types)
     */
    public function getRequesterNameAttribute(): string
    {
        if ($this->isExternal()) {
            return $this->external_requester_name ?? 'External Requester';
        }
        
        if ($this->submitter) {
            return $this->submitter->name;
        }
        
        return 'Unknown';
    }

    /**
     * Get requester email (handles all source types)
     */
    public function getRequesterEmailAttribute(): ?string
    {
        if ($this->isExternal()) {
            return $this->external_requester_email;
        }
        
        return $this->submitter?->email;
    }

    /**
     * Get requester organization (handles all source types)
     */
    public function getRequesterOrganizationAttribute(): ?string
    {
        if ($this->isExternal()) {
            return $this->external_requester_organization;
        }
        
        if ($this->institution) {
            return $this->institution->name;
        }
        
        return $this->submitter?->institution?->name;
    }
}
