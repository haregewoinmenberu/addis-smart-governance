<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResearchAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'research_idea_id',
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

    public function researchIdea()
    {
        return $this->belongsTo(ResearchIdea::class);
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
}
