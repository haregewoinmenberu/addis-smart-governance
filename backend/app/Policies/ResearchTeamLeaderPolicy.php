<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ResearchIdea;
use App\Models\ResearchAssignment;
use App\Models\ResearchWorkflowProgress;
use App\Services\RoleHierarchyService;

class ResearchTeamLeaderPolicy
{
    /**
     * Determine if the user can view research assigned to them
     */
    public function viewAssignedResearch(User $user, ResearchIdea $research): bool
    {
        // Check if user is assigned as team leader to this research
        $isAssigned = ResearchAssignment::where('research_idea_id', $research->id)
            ->where('assigned_to', $user->id)
            ->where('assignment_type', 'team_leader')
            ->whereIn('status', ['pending', 'accepted', 'in_progress'])
            ->exists();

        return $isAssigned;
    }

    /**
     * Determine if the user can assign officers to research
     */
    public function assignOfficer(User $user, ResearchIdea $research): bool
    {
        // Must be assigned as team leader and assignment must be accepted/in_progress
        $assignment = ResearchAssignment::where('research_idea_id', $research->id)
            ->where('assigned_to', $user->id)
            ->where('assignment_type', 'team_leader')
            ->whereIn('status', ['accepted', 'in_progress'])
            ->first();

        return $assignment !== null;
    }

    /**
     * Determine if the user can manage a specific officer
     */
    public function manageOfficer(User $user, User $officer): bool
    {
        // Check if officer is in user's hierarchy
        $manageableUsers = RoleHierarchyService::getManageableUsers($user);
        
        if (!$manageableUsers->contains('id', $officer->id)) {
            return false;
        }

        // Verify officer has research_officer role
        return $officer->roles->pluck('name')->contains(function ($role) {
            return str_contains($role, 'research_officer');
        });
    }

    /**
     * Determine if the user can review a workflow stage
     */
    public function reviewStage(User $user, ResearchWorkflowProgress $progress): bool
    {
        // Check if research is assigned to this team leader
        $isAssigned = ResearchAssignment::where('research_idea_id', $progress->research_idea_id)
            ->where('assigned_to', $user->id)
            ->where('assignment_type', 'team_leader')
            ->whereIn('status', ['accepted', 'in_progress'])
            ->exists();

        if (!$isAssigned) {
            return false;
        }

        // Check if stage is pending review
        // No per-stage approver designation exists in the schema, so any stage
        // pending review on this team leader's assigned research is reviewable.
        return $progress->status === 'pending_review';
    }

    /**
     * Determine if the user can work on a workflow stage
     */
    public function workOnStage(User $user, ResearchWorkflowProgress $progress): bool
    {
        // Check if research is assigned to this team leader
        return ResearchAssignment::where('research_idea_id', $progress->research_idea_id)
            ->where('assigned_to', $user->id)
            ->where('assignment_type', 'team_leader')
            ->whereIn('status', ['accepted', 'in_progress'])
            ->exists();
    }

    /**
     * Determine if the user can reassign an officer
     */
    public function reassignOfficer(User $user, ResearchAssignment $assignment): bool
    {
        // Must be the one who assigned the officer
        if ($assignment->assigned_by !== $user->id) {
            return false;
        }

        // Must be officer assignment
        if ($assignment->assignment_type !== 'officer') {
            return false;
        }

        return true;
    }

    /**
     * Determine if the user can remove an officer assignment
     */
    public function removeOfficerAssignment(User $user, ResearchAssignment $assignment): bool
    {
        return $this->reassignOfficer($user, $assignment);
    }

    /**
     * Determine if the user can view officer work
     */
    public function viewOfficerWork(User $user, ResearchAssignment $assignment): bool
    {
        // Check if this is an officer assigned by this team leader
        return $assignment->assignment_type === 'officer' && 
               $assignment->assigned_by === $user->id;
    }

    /**
     * Team leader cannot approve their own final report
     */
    public function approveFinalReport(User $user, ResearchIdea $research): bool
    {
        // Team leaders can never approve final reports (only directors can)
        return false;
    }

    /**
     * Team leader cannot forward to Smart City
     */
    public function forwardToSmartCity(User $user, ResearchIdea $research): bool
    {
        return false;
    }

    /**
     * Team leader cannot view research assigned to other team leaders
     */
    public function viewOthersResearch(User $user, ResearchIdea $research): bool
    {
        return $this->viewAssignedResearch($user, $research);
    }
}
