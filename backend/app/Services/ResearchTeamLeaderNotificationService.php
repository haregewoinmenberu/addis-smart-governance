<?php

namespace App\Services;

use App\Models\User;
use App\Models\ResearchIdea;
use App\Models\ResearchAssignment;
use App\Models\ResearchWorkflowProgress;
use App\Models\Notification;

class ResearchTeamLeaderNotificationService
{
    /**
     * Notify team leader when director assigns research
     */
    public static function notifyResearchAssigned(ResearchAssignment $assignment)
    {
        if ($assignment->assignment_type !== 'team_leader') {
            return;
        }

        $teamLeader = $assignment->assignedTo;
        $research = $assignment->researchIdea;
        $director = $assignment->assignedBy;

        Notification::create([
            'user_id' => $teamLeader->id,
            'title' => 'New Research Assignment',
            'message' => "You have been assigned to research: {$research->title}",
            'type' => 'research_assignment',
            'channel' => 'in_app',
            'priority' => 'high',
            'action_url' => "/research/ideas/{$research->id}/workspace",
            'action_text' => 'View Research',
            'data' => [
                'research_id' => $research->id,
                'research_title' => $research->title,
                'assigned_by' => $director->name,
                'assignment_id' => $assignment->id,
            ],
            'sent_at' => now(),
        ]);
    }

    /**
     * Notify team leader when officer submits work
     */
    public static function notifyOfficerSubmission(ResearchWorkflowProgress $progress)
    {
        // Get team leader assigned to this research
        $teamLeaderAssignment = ResearchAssignment::where('research_idea_id', $progress->research_idea_id)
            ->where('assignment_type', 'team_leader')
            ->whereIn('status', ['accepted', 'in_progress'])
            ->with('assignedTo')
            ->first();

        if (!$teamLeaderAssignment) {
            return;
        }

        $teamLeader = $teamLeaderAssignment->assignedTo;
        $research = $progress->researchIdea;
        $officer = $progress->assignedUser;

        Notification::create([
            'user_id' => $teamLeader->id,
            'title' => 'Officer Work Submitted',
            'message' => "{$officer->name} submitted {$progress->stage->name} for review",
            'type' => 'work_submission',
            'channel' => 'in_app',
            'priority' => 'high',
            'action_url' => "/research/ideas/{$research->id}/workflow/{$progress->id}/review",
            'action_text' => 'Review Submission',
            'data' => [
                'research_id' => $research->id,
                'research_title' => $research->title,
                'stage_name' => $progress->stage->name,
                'submitted_by' => $officer->name,
                'progress_id' => $progress->id,
            ],
            'sent_at' => now(),
        ]);
    }

    /**
     * Notify team leader when officer misses deadline
     */
    public static function notifyMissedDeadline(ResearchWorkflowProgress $progress)
    {
        // Get team leader assigned to this research
        $teamLeaderAssignment = ResearchAssignment::where('research_idea_id', $progress->research_idea_id)
            ->where('assignment_type', 'team_leader')
            ->whereIn('status', ['accepted', 'in_progress'])
            ->with('assignedTo')
            ->first();

        if (!$teamLeaderAssignment) {
            return;
        }

        $teamLeader = $teamLeaderAssignment->assignedTo;
        $research = $progress->researchIdea;
        $officer = $progress->assignedUser;

        Notification::create([
            'user_id' => $teamLeader->id,
            'title' => 'Deadline Missed',
            'message' => "{$progress->stage->name} is overdue - assigned to {$officer->name}",
            'type' => 'deadline_missed',
            'channel' => 'in_app',
            'priority' => 'critical',
            'action_url' => "/research/ideas/{$research->id}/workspace?tab=workflow",
            'action_text' => 'View Progress',
            'data' => [
                'research_id' => $research->id,
                'research_title' => $research->title,
                'stage_name' => $progress->stage->name,
                'assigned_to' => $officer->name,
                'progress_id' => $progress->id,
            ],
            'sent_at' => now(),
        ]);
    }

    /**
     * Notify team leader when director requests revision
     */
    public static function notifyRevisionRequested(ResearchWorkflowProgress $progress, $reviewComments)
    {
        // Get team leader assigned to this research
        $teamLeaderAssignment = ResearchAssignment::where('research_idea_id', $progress->research_idea_id)
            ->where('assignment_type', 'team_leader')
            ->whereIn('status', ['accepted', 'in_progress'])
            ->with('assignedTo')
            ->first();

        if (!$teamLeaderAssignment) {
            return;
        }

        $teamLeader = $teamLeaderAssignment->assignedTo;
        $research = $progress->researchIdea;

        Notification::create([
            'user_id' => $teamLeader->id,
            'title' => 'Revision Requested',
            'message' => "Research Director requested revision on {$progress->stage->name}",
            'type' => 'revision_requested',
            'channel' => 'in_app',
            'priority' => 'high',
            'action_url' => "/research/ideas/{$research->id}/workflow/{$progress->id}/work",
            'action_text' => 'View & Revise',
            'data' => [
                'research_id' => $research->id,
                'research_title' => $research->title,
                'stage_name' => $progress->stage->name,
                'review_comments' => $reviewComments,
                'progress_id' => $progress->id,
            ],
            'sent_at' => now(),
        ]);
    }

    /**
     * Notify officer when team leader assigns new task
     */
    public static function notifyOfficerAssigned(ResearchAssignment $assignment)
    {
        if ($assignment->assignment_type !== 'officer') {
            return;
        }

        $officer = $assignment->assignedTo;
        $research = $assignment->researchIdea;
        $teamLeader = $assignment->assignedBy;

        Notification::create([
            'user_id' => $officer->id,
            'title' => 'New Research Assignment',
            'message' => "{$teamLeader->name} assigned you to: {$research->title}",
            'type' => 'research_assignment',
            'channel' => 'in_app',
            'priority' => 'high',
            'action_url' => "/research/ideas/{$research->id}/workspace",
            'action_text' => 'View Assignment',
            'data' => [
                'research_id' => $research->id,
                'research_title' => $research->title,
                'assigned_by' => $teamLeader->name,
                'assignment_notes' => $assignment->assignment_notes,
                'assignment_id' => $assignment->id,
            ],
            'sent_at' => now(),
        ]);
    }

    /**
     * Notify officer when assignment is updated
     */
    public static function notifyAssignmentUpdated(ResearchAssignment $assignment, $changeType)
    {
        if ($assignment->assignment_type !== 'officer') {
            return;
        }

        $officer = $assignment->assignedTo;
        $research = $assignment->researchIdea;

        $messages = [
            'reassigned' => 'Your assignment has been updated',
            'deadline_changed' => 'Assignment deadline has been changed',
            'notes_updated' => 'Assignment instructions have been updated',
        ];

        Notification::create([
            'user_id' => $officer->id,
            'title' => 'Assignment Updated',
            'message' => $messages[$changeType] ?? 'Your assignment has been updated',
            'type' => 'assignment_updated',
            'channel' => 'in_app',
            'priority' => 'medium',
            'action_url' => "/research/ideas/{$research->id}/workspace",
            'action_text' => 'View Details',
            'data' => [
                'research_id' => $research->id,
                'research_title' => $research->title,
                'change_type' => $changeType,
                'assignment_id' => $assignment->id,
            ],
            'sent_at' => now(),
        ]);
    }

    /**
     * Notify officer when team leader requests revision
     */
    public static function notifyOfficerRevisionRequested(ResearchWorkflowProgress $progress, $reviewComments)
    {
        if (!$progress->assignedUser) {
            return;
        }

        $officer = $progress->assignedUser;
        $research = $progress->researchIdea;

        Notification::create([
            'user_id' => $officer->id,
            'title' => 'Revision Requested',
            'message' => "Team Leader requested revision on {$progress->stage->name}",
            'type' => 'revision_requested',
            'channel' => 'in_app',
            'priority' => 'high',
            'action_url' => "/research/ideas/{$research->id}/workflow/{$progress->id}/work",
            'action_text' => 'View & Revise',
            'data' => [
                'research_id' => $research->id,
                'research_title' => $research->title,
                'stage_name' => $progress->stage->name,
                'review_comments' => $reviewComments,
                'progress_id' => $progress->id,
            ],
            'sent_at' => now(),
        ]);
    }

    /**
     * Notify officer when work is approved
     */
    public static function notifyOfficerWorkApproved(ResearchWorkflowProgress $progress)
    {
        if (!$progress->assignedUser) {
            return;
        }

        $officer = $progress->assignedUser;
        $research = $progress->researchIdea;

        Notification::create([
            'user_id' => $officer->id,
            'title' => 'Work Approved',
            'message' => "Your submission for {$progress->stage->name} has been approved",
            'type' => 'work_approved',
            'channel' => 'in_app',
            'priority' => 'medium',
            'action_url' => "/research/ideas/{$research->id}/workspace?tab=workflow",
            'action_text' => 'View Progress',
            'data' => [
                'research_id' => $research->id,
                'research_title' => $research->title,
                'stage_name' => $progress->stage->name,
                'progress_id' => $progress->id,
            ],
            'sent_at' => now(),
        ]);
    }

    /**
     * Notify officer when deadline is changed
     */
    public static function notifyDeadlineChanged(ResearchWorkflowProgress $progress, $oldDeadline, $newDeadline)
    {
        if (!$progress->assignedUser) {
            return;
        }

        $officer = $progress->assignedUser;
        $research = $progress->researchIdea;

        Notification::create([
            'user_id' => $officer->id,
            'title' => 'Deadline Changed',
            'message' => "Deadline for {$progress->stage->name} has been updated",
            'type' => 'deadline_changed',
            'channel' => 'in_app',
            'priority' => 'medium',
            'action_url' => "/research/ideas/{$research->id}/workspace?tab=workflow",
            'action_text' => 'View Details',
            'data' => [
                'research_id' => $research->id,
                'research_title' => $research->title,
                'stage_name' => $progress->stage->name,
                'old_deadline' => $oldDeadline,
                'new_deadline' => $newDeadline,
                'progress_id' => $progress->id,
            ],
            'sent_at' => now(),
        ]);
    }
}
