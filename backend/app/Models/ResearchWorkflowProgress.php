<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResearchWorkflowProgress extends Model
{
    use HasFactory;

    protected $table = 'research_workflow_progress';

    protected $fillable = [
        'research_idea_id',
        'stage_id',
        'status',
        'stage_data',
        'notes',
        'assigned_to',
        'started_at',
        'submitted_at',
        'completed_at',
        'completed_by',
    ];

    protected $casts = [
        'stage_data' => 'array',
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function researchIdea()
    {
        return $this->belongsTo(ResearchIdea::class);
    }

    public function stage()
    {
        return $this->belongsTo(ResearchWorkflowStage::class, 'stage_id');
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function completedBy()
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    public function reviews()
    {
        return $this->hasMany(ResearchStageReview::class, 'workflow_progress_id');
    }

    /**
     * Check if user can work on this stage
     */
    public function canBeWorkedOnBy(User $user): bool
    {
        // itdb_administrator is a system-level override, always allowed
        if ($user->hasRole('itdb_administrator')) {
            return true;
        }

        // If this stage is restricted to a specific role, only that role may
        // fill it — this narrows every check below, including the director's
        // usual oversight bypass, so a stage restricted to e.g. 'research_officer'
        // genuinely cannot be filled by the director instead.
        $requiredRole = $this->stage->fillable_by_role;
        if ($requiredRole && !$user->hasRole($requiredRole)) {
            return false;
        }

        // Research Director has oversight authority — can work on any stage
        // not restricted away from them above
        if ($user->hasRole('research_director')) {
            return true;
        }

        // If specifically assigned to this user
        if ($this->assigned_to === $user->id) {
            return true;
        }

        // If not specifically assigned yet, check if user is assigned to this research
        if ($this->assigned_to === null) {
            $isAssignedToResearch = ResearchAssignment::where('research_idea_id', $this->research_idea_id)
                ->where('assigned_to', $user->id)
                ->whereIn('status', ['accepted', 'in_progress'])
                ->exists();

            if ($isAssignedToResearch) {
                return true;
            }
        }

        // Research Team Leader can work on their assigned research stages
        if ($user->hasRole('research_team_leader')) {
            $isAssignedToResearch = ResearchAssignment::where('research_idea_id', $this->research_idea_id)
                ->where('assigned_to', $user->id)
                ->where('assignment_type', 'team_leader')
                ->whereIn('status', ['accepted', 'in_progress'])
                ->exists();

            if ($isAssignedToResearch) {
                return true;
            }
        }

        // Research Officer can work on stages assigned to them via officer assignment
        if ($user->hasRole('research_officer')) {
            $isAssignedAsOfficer = ResearchAssignment::where('research_idea_id', $this->research_idea_id)
                ->where('assigned_to', $user->id)
                ->where('assignment_type', 'officer')
                ->whereIn('status', ['pending', 'accepted', 'in_progress'])
                ->exists();

            if ($isAssignedAsOfficer) {
                return true;
            }
        }

        return false;
    }

    /**
     * Start working on this stage
     */
    public function start(User $user)
    {
        if (!$this->canBeWorkedOnBy($user)) {
            throw new \Exception('User cannot work on this stage');
        }

        $this->update([
            'status' => 'in_progress',
            'started_at' => $this->started_at ?? now(),
            'assigned_to' => $user->id,
        ]);
    }

    /**
     * Submit stage for review
     */
    public function submit(User $user, array $data)
    {
        if (!$this->canBeWorkedOnBy($user)) {
            throw new \Exception('User cannot submit this stage');
        }

        $this->update([
            'status' => $this->stage->requires_approval ? 'pending_review' : 'completed',
            'stage_data' => $data,
            'submitted_at' => now(),
            'completed_at' => $this->stage->requires_approval ? null : now(),
            'completed_by' => $this->stage->requires_approval ? null : $user->id,
        ]);
    }

    /**
     * Mark as completed (after approval)
     */
    public function markCompleted(User $user)
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'completed_by' => $user->id,
        ]);
    }
}
