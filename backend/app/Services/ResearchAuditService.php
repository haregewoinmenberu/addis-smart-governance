<?php

namespace App\Services;

use App\Models\User;
use App\Models\ResearchIdea;
use App\Models\ResearchAssignment;
use App\Models\ResearchWorkflowProgress;
use Illuminate\Support\Facades\DB;

class ResearchAuditService
{
    /**
     * Log research assignment
     */
    public static function logAssignment(ResearchAssignment $assignment, User $user)
    {
        DB::table('activity_log')->insert([
            'subject_type' => ResearchIdea::class,
            'subject_id' => $assignment->research_idea_id,
            'causer_type' => User::class,
            'causer_id' => $user->id,
            'description' => sprintf(
                '%s assigned %s to research #%d as %s',
                $user->name,
                $assignment->assignedTo->name,
                $assignment->research_idea_id,
                $assignment->assignment_type
            ),
            'properties' => json_encode([
                'assignment_id' => $assignment->id,
                'assigned_to' => $assignment->assigned_to,
                'assignment_type' => $assignment->assignment_type,
                'assignment_notes' => $assignment->assignment_notes,
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Log research reassignment
     */
    public static function logReassignment(ResearchAssignment $assignment, User $user, $oldAssignee, $newAssignee)
    {
        DB::table('activity_log')->insert([
            'subject_type' => ResearchIdea::class,
            'subject_id' => $assignment->research_idea_id,
            'causer_type' => User::class,
            'causer_id' => $user->id,
            'description' => sprintf(
                '%s reassigned research from %s to %s',
                $user->name,
                $oldAssignee,
                $newAssignee
            ),
            'properties' => json_encode([
                'assignment_id' => $assignment->id,
                'old_assignee' => $oldAssignee,
                'new_assignee' => $newAssignee,
                'assignment_type' => $assignment->assignment_type,
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Log workflow stage approval
     */
    public static function logApproval(ResearchWorkflowProgress $progress, User $user, $decision)
    {
        DB::table('activity_log')->insert([
            'subject_type' => ResearchIdea::class,
            'subject_id' => $progress->research_idea_id,
            'causer_type' => User::class,
            'causer_id' => $user->id,
            'description' => sprintf(
                '%s %s stage "%s" for research #%d',
                $user->name,
                $decision,
                $progress->stage->name,
                $progress->research_idea_id
            ),
            'properties' => json_encode([
                'progress_id' => $progress->id,
                'stage_name' => $progress->stage->name,
                'decision' => $decision,
                'status' => $progress->status,
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Log workflow stage rejection
     */
    public static function logRejection(ResearchWorkflowProgress $progress, User $user, $comments)
    {
        DB::table('activity_log')->insert([
            'subject_type' => ResearchIdea::class,
            'subject_id' => $progress->research_idea_id,
            'causer_type' => User::class,
            'causer_id' => $user->id,
            'description' => sprintf(
                '%s rejected stage "%s" for research #%d',
                $user->name,
                $progress->stage->name,
                $progress->research_idea_id
            ),
            'properties' => json_encode([
                'progress_id' => $progress->id,
                'stage_name' => $progress->stage->name,
                'comments' => $comments,
                'status' => $progress->status,
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Log workflow stage change
     */
    public static function logWorkflowChange(ResearchWorkflowProgress $progress, User $user, $action, $oldStatus = null)
    {
        DB::table('activity_log')->insert([
            'subject_type' => ResearchIdea::class,
            'subject_id' => $progress->research_idea_id,
            'causer_type' => User::class,
            'causer_id' => $user->id,
            'description' => sprintf(
                '%s %s stage "%s" for research #%d',
                $user->name,
                $action,
                $progress->stage->name,
                $progress->research_idea_id
            ),
            'properties' => json_encode([
                'progress_id' => $progress->id,
                'stage_name' => $progress->stage->name,
                'action' => $action,
                'old_status' => $oldStatus,
                'new_status' => $progress->status,
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Log comment added
     */
    public static function logComment(ResearchIdea $research, User $user, $comment)
    {
        DB::table('activity_log')->insert([
            'subject_type' => ResearchIdea::class,
            'subject_id' => $research->id,
            'causer_type' => User::class,
            'causer_id' => $user->id,
            'description' => sprintf(
                '%s added a comment on research #%d',
                $user->name,
                $research->id
            ),
            'properties' => json_encode([
                'comment' => $comment,
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Log status change
     */
    public static function logStatusChange(ResearchIdea $research, User $user, $oldStatus, $newStatus)
    {
        DB::table('activity_log')->insert([
            'subject_type' => ResearchIdea::class,
            'subject_id' => $research->id,
            'causer_type' => User::class,
            'causer_id' => $user->id,
            'description' => sprintf(
                '%s changed research status from %s to %s',
                $user->name,
                $oldStatus,
                $newStatus
            ),
            'properties' => json_encode([
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Log assignment removal
     */
    public static function logAssignmentRemoval(ResearchAssignment $assignment, User $user)
    {
        DB::table('activity_log')->insert([
            'subject_type' => ResearchIdea::class,
            'subject_id' => $assignment->research_idea_id,
            'causer_type' => User::class,
            'causer_id' => $user->id,
            'description' => sprintf(
                '%s removed %s assignment from research #%d',
                $user->name,
                $assignment->assignedTo->name,
                $assignment->research_idea_id
            ),
            'properties' => json_encode([
                'assignment_id' => $assignment->id,
                'removed_assignee' => $assignment->assignedTo->name,
                'assignment_type' => $assignment->assignment_type,
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Get activity log for research
     */
    public static function getResearchActivity(int $researchId, int $limit = 50)
    {
        return DB::table('activity_log')
            ->where('subject_type', ResearchIdea::class)
            ->where('subject_id', $researchId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($log) {
                $log->properties = json_decode($log->properties, true);
                return $log;
            });
    }
}
