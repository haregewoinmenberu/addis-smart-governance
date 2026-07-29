<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceRequestAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_request_id',
        'assigned_by',
        'assigned_to',
        'assignment_type',
        'assignment_notes',
        'assigned_date',
        'accepted_date',
        'completed_date',
        'status',
    ];

    protected $casts = [
        'assigned_date' => 'datetime',
        'accepted_date' => 'datetime',
        'completed_date' => 'datetime',
    ];

    public function serviceRequest()
    {
        return $this->belongsTo(ServiceFormSubmission::class, 'service_request_id');
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Check if user can accept this assignment
     */
    public function canBeAcceptedBy(User $user): bool
    {
        return $this->assigned_to === $user->id && $this->status === 'pending';
    }

    /**
     * Accept the assignment
     */
    public function accept(User $user)
    {
        if (!$this->canBeAcceptedBy($user)) {
            throw new \Exception('Assignment cannot be accepted');
        }

        $this->update([
            'status' => 'accepted',
            'accepted_date' => now(),
        ]);
    }

    /**
     * Start working on the assignment
     */
    public function start(User $user)
    {
        if ($this->assigned_to !== $user->id) {
            throw new \Exception('Only assigned user can start this assignment');
        }

        if (!in_array($this->status, ['pending', 'accepted'])) {
            throw new \Exception('Assignment cannot be started from current status');
        }

        $this->update(['status' => 'in_progress']);
    }

    /**
     * Complete the assignment
     */
    public function complete(User $user)
    {
        if ($this->assigned_to !== $user->id) {
            throw new \Exception('Only assigned user can complete this assignment');
        }

        $this->update([
            'status' => 'completed',
            'completed_date' => now(),
        ]);
    }

    /**
     * Reject the assignment
     */
    public function reject(User $user, string $reason = null)
    {
        if ($this->assigned_to !== $user->id) {
            throw new \Exception('Only assigned user can reject this assignment');
        }

        $this->update([
            'status' => 'rejected',
            'assignment_notes' => $reason ? ($this->assignment_notes . "\nRejection: " . $reason) : $this->assignment_notes,
        ]);
    }
}
