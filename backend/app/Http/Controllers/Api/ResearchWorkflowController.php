<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchIdea;
use App\Models\ResearchWorkflowStage;
use App\Models\ResearchWorkflowProgress;
use App\Models\ResearchStageReview;
use App\Models\ResearchAssignment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ResearchWorkflowController extends Controller
{
    /**
     * Get workflow stages configuration
     * Optionally filtered by request type: ?type=system|infrastructure|all
     */
    public function getStages(Request $request)
    {
        $requestType = $request->query('type'); // 'system', 'infrastructure', or null (all)

        $query = ResearchWorkflowStage::active()->ordered();

        // If a request type is given, return stages for that type + universal stages
        if ($requestType && in_array($requestType, ['system', 'infrastructure'])) {
            $query->where(function ($q) use ($requestType) {
                $q->where('applies_to', 'all')
                  ->orWhere('applies_to', $requestType);
            });
        }

        $stages = $query->get();

        return response()->json([
            'success' => true,
            'data' => $stages,
        ]);
    }

    /**
     * Get single workflow progress
     */
    public function getProgressItem(ResearchWorkflowProgress $progress)
    {
        return response()->json([
            'success' => true,
            'data' => $progress->load(['stage', 'assignedUser', 'completedBy', 'reviews.reviewer']),
        ]);
    }

    /**
     * Get workflow progress for a research idea
     */
    public function getProgress(ResearchIdea $researchIdea)
    {
        $progress = $researchIdea->workflowProgress()
            ->with(['stage', 'assignedUser', 'completedBy', 'reviews.reviewer'])
            ->get();

        $progressPercentage = $researchIdea->getProgressPercentage();

        return response()->json([
            'success' => true,
            'data' => [
                'progress' => $progress,
                'percentage' => $progressPercentage,
            ],
        ]);
    }

    /**
     * Initialize evaluation workflow for a technology request.
     * Only creates progress records for stages relevant to the request type.
     */
    public function initializeWorkflow(Request $request, ResearchIdea $researchIdea)
    {
        // Check if already initialized
        if ($researchIdea->workflowProgress()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Evaluation process already initialized',
            ], 422);
        }

        // Determine request type from category (system / infrastructure)
        $requestType = $researchIdea->getRequestType();

        // Load only stages applicable to this request type
        $stages = ResearchWorkflowStage::active()->ordered()
            // ->where(function ($q) use ($requestType) {
            //     $q->where('applies_to', 'all')
            //       ->orWhere('applies_to', $requestType);
            // })
            ->get();

        DB::transaction(function () use ($researchIdea, $stages) {
            foreach ($stages as $stage) {
                ResearchWorkflowProgress::create([
                    'research_idea_id' => $researchIdea->id,
                    'stage_id' => $stage->id,
                    'status' => 'not_started',
                ]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Evaluation process initialized successfully',
            'data' => $researchIdea->workflowProgress()->with('stage')->get(),
        ]);
    }

    /**
     * Start a workflow stage
     */
    public function startStage(Request $request, ResearchWorkflowProgress $progress)
    {
        $user = $request->user();

        if (!$progress->canBeWorkedOnBy($user)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to work on this stage',
            ], 403);
        }

        $progress->start($user);

        return response()->json([
            'success' => true,
            'message' => 'Stage started successfully',
            'data' => $progress->fresh()->load(['stage', 'assignedUser']),
        ]);
    }

    /**
     * Submit a workflow stage
     */
    public function submitStage(Request $request, ResearchWorkflowProgress $progress)
    {
        $user = $request->user();

        if (!$progress->canBeWorkedOnBy($user)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to submit this stage',
            ], 403);
        }

        $validated = $request->validate([
            'stage_data' => 'required|array',
            'notes' => 'nullable|string',
        ]);

        $progress->submit($user, $validated['stage_data']);

        if ($validated['notes'] ?? null) {
            $progress->update(['notes' => $validated['notes']]);
        }

        // Send notification to team leader if this is an officer submission
        if ($progress->stage->approver_role === 'research_team_leader') {
            \App\Services\ResearchTeamLeaderNotificationService::notifyOfficerSubmission($progress);
        }

        return response()->json([
            'success' => true,
            'message' => 'Stage submitted successfully',
            'data' => $progress->fresh()->load(['stage', 'assignedUser']),
        ]);
    }

    /**
     * Review a workflow stage (approve/reject/request revision)
     */
    public function reviewStage(Request $request, ResearchWorkflowProgress $progress)
    {
        $user = $request->user();

        // Check if user has the permission to review stages at all
        if (!$user->hasPermission('review_research_stage')) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to review stages',
            ], 403);
        }

        // Check if stage requires approval
        if (!$progress->stage->requires_approval) {
            return response()->json([
                'success' => false,
                'message' => 'This stage does not require approval',
            ], 422);
        }

        // Check if stage is pending review
        if ($progress->status !== 'pending_review') {
            return response()->json([
                'success' => false,
                'message' => 'Stage is not pending review',
            ], 422);
        }

        // Enforce approver-role: the stage designates WHICH role can review it.
        // research_director reviews director-designated stages,
        // research_team_leader reviews team-leader-designated stages.
        $approverRole = $progress->stage->approver_role;
        $userRoleNames = $user->roles->pluck('name')->toArray();
        $isDesignatedApprover = in_array($approverRole, $userRoleNames);

        // itdb_administrator can review any stage
        $isAdmin = $user->hasRole('itdb_administrator') || $user->hasRole('bureau_head');

        // research_director can also review team-leader-level stages when needed
        // (oversight authority — director can step in for any stage in their domain)
        $isResearchDirector = $user->hasRole('research_director');
        $isResearchDomain = in_array($approverRole, ['research_team_leader', 'research_director', 'research_officer']);

        if (!$isDesignatedApprover && !$isAdmin && !($isResearchDirector && $isResearchDomain)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not the designated approver for this stage. This stage requires a ' . str_replace('_', ' ', $approverRole) . ' to review it.',
            ], 403);
        }

        // For team leaders: they must be assigned to this research idea
        $isTeamLeader = in_array('research_team_leader', $userRoleNames);
        if ($isTeamLeader && !$isAdmin && !$isResearchDirector) {
            $isAssignedToResearch = ResearchAssignment::where('research_idea_id', $progress->research_idea_id)
                ->where('assigned_to', $user->id)
                ->where('assignment_type', 'team_leader')
                ->whereIn('status', ['accepted', 'in_progress'])
                ->exists();

            if (!$isAssignedToResearch) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only review stages for research assigned to you',
                ], 403);
            }
        }

        $validated = $request->validate([
            'decision' => 'required|in:approved,rejected,revision_requested',
            'review_comments' => 'required|string|min:10',
            'review_data' => 'nullable|array',
        ]);

        DB::transaction(function () use ($progress, $user, $validated) {
            $review = ResearchStageReview::create([
                'workflow_progress_id' => $progress->id,
                'reviewed_by' => $user->id,
                'decision' => $validated['decision'],
                'review_comments' => $validated['review_comments'],
                'review_data' => $validated['review_data'] ?? null,
                'reviewed_at' => now(),
            ]);

            $review->applyDecision();

            // Send notifications based on decision
            if ($validated['decision'] === 'revision_requested') {
                // Notify officer about revision request
                \App\Services\ResearchTeamLeaderNotificationService::notifyOfficerRevisionRequested(
                    $progress,
                    $validated['review_comments']
                );
            } elseif ($validated['decision'] === 'approved') {
                // Notify officer about approval
                \App\Services\ResearchTeamLeaderNotificationService::notifyOfficerWorkApproved($progress);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Stage reviewed successfully',
            'data' => $progress->fresh()->load(['stage', 'assignedUser', 'reviews.reviewer']),
        ]);
    }


    /**
     * Get available team leaders for assignment
     */
    public function getAvailableTeamLeaders(Request $request)
    {
        $user = $request->user();

        // Check permission
        if (!$user->hasPermission('assign_team_leader') && !$user->hasPermission('assign_research')) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to assign team leaders',
            ], 403);
        }

        // Get manageable users with any team_leader role
        $teamLeaders = \App\Services\RoleHierarchyService::getManageableUsers($user)
            ->filter(function ($u) {
                return $u->roles->pluck('name')->contains(function ($role) {
                    return str_contains($role, 'team_leader');
                });
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => $teamLeaders,
        ]);
    }

    /**
     * Get available officers for assignment
     */
    public function getAvailableOfficers(Request $request)
    {
        $user = $request->user();

        // Check permission
        if (!$user->hasPermission('assign_officer') && !$user->hasPermission('assign_research')) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to assign officers',
            ], 403);
        }

        // For research_director: get officers recursively (director -> team_leader -> officer)
        // For research_team_leader: get direct reports (officers)
        if ($user->hasRole('research_director') || $user->hasRole('smart_city_sector_head') || $user->hasRole('bureau_head')) {
            $officers = \App\Services\RoleHierarchyService::getAllManageableUsersRecursive($user)
                ->filter(function ($u) {
                    return $u->roles->pluck('name')->contains(function ($role) {
                        return str_contains($role, 'officer');
                    });
                })
                ->values();
        } else {
            $officers = \App\Services\RoleHierarchyService::getManageableUsers($user)
                ->filter(function ($u) {
                    return $u->roles->pluck('name')->contains(function ($role) {
                        return str_contains($role, 'officer');
                    });
                })
                ->values();
        }

        return response()->json([
            'success' => true,
            'data' => $officers,
        ]);
    }

    /**
     * Assign team leader to research
     */
    public function assignTeamLeader(Request $request, ResearchIdea $researchIdea)
    {
        $user = $request->user();

        // Check if user has management capabilities
        if (!\App\Services\RoleHierarchyService::hasUserManagementCapability($user)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to assign team leaders',
            ], 403);
        }

        $validated = $request->validate([
            'team_leader_id' => 'required|exists:users,id',
            'assignment_notes' => 'nullable|string',
        ]);

        // Verify the user has a team leader role
        $teamLeader = User::find($validated['team_leader_id']);
        $hasTeamLeaderRole = $teamLeader->roles->pluck('name')->contains(function ($role) {
            return str_contains($role, 'team_leader');
        });

        if (!$hasTeamLeaderRole) {
            return response()->json([
                'success' => false,
                'message' => 'Selected user is not a team leader',
            ], 422);
        }

        // Verify team leader is in user's hierarchy
        $manageableUsers = \App\Services\RoleHierarchyService::getManageableUsers($user);
        if (!$manageableUsers->contains('id', $validated['team_leader_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'You can only assign team leaders within your hierarchy',
            ], 403);
        }

        $assignment = ResearchAssignment::create([
            'research_idea_id' => $researchIdea->id,
            'assigned_by' => $user->id,
            'assigned_to' => $validated['team_leader_id'],
            'assignment_type' => 'team_leader',
            'assignment_notes' => $validated['assignment_notes'] ?? null,
            'assigned_date' => now(),
            'status' => 'pending',
        ]);

        // Log assignment
        \App\Services\ResearchAuditService::logAssignment($assignment, $user);

        // Send notification to team leader
        \App\Services\ResearchTeamLeaderNotificationService::notifyResearchAssigned($assignment);

        return response()->json([
            'success' => true,
            'message' => 'Team leader assigned successfully',
            'data' => $assignment->load(['assignedBy', 'assignedTo']),
        ]);
    }

    /**
     * Assign officer to research
     */
    public function assignOfficer(Request $request, ResearchIdea $researchIdea)
    {
        $user = $request->user();

        // Check if user has management capabilities
        if (!\App\Services\RoleHierarchyService::hasUserManagementCapability($user)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to assign officers',
            ], 403);
        }

        // If team leader, verify they are assigned to this research
        $userRoles = $user->roles->pluck('name');
        $isTeamLeader = $userRoles->contains(function ($role) {
            return str_contains($role, 'team_leader');
        });

        if ($isTeamLeader) {
            $isAssignedToResearch = ResearchAssignment::where('research_idea_id', $researchIdea->id)
                ->where('assigned_to', $user->id)
                ->where('assignment_type', 'team_leader')
                ->whereIn('status', ['accepted', 'in_progress'])
                ->exists();

            if (!$isAssignedToResearch) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only assign officers to research assigned to you',
                ], 403);
            }
        }

        $validated = $request->validate([
            'officer_id' => 'required|exists:users,id',
            'assignment_notes' => 'nullable|string',
        ]);

        // Verify the user has an officer role
        $officer = User::find($validated['officer_id']);
        $hasOfficerRole = $officer->roles->pluck('name')->contains(function ($role) {
            return str_contains($role, 'officer');
        });

        if (!$hasOfficerRole) {
            return response()->json([
                'success' => false,
                'message' => 'Selected user is not an officer',
            ], 422);
        }

        // Verify officer is in user's hierarchy
        $manageableUsers = \App\Services\RoleHierarchyService::getManageableUsers($user);
        if (!$manageableUsers->contains('id', $validated['officer_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'You can only assign officers within your hierarchy',
            ], 403);
        }

        $assignment = ResearchAssignment::create([
            'research_idea_id' => $researchIdea->id,
            'assigned_by' => $user->id,
            'assigned_to' => $validated['officer_id'],
            'assignment_type' => 'officer',
            'assignment_notes' => $validated['assignment_notes'] ?? null,
            'assigned_date' => now(),
            'status' => 'pending',
        ]);

        // Log assignment
        \App\Services\ResearchAuditService::logAssignment($assignment, $user);

        // Send notification to officer
        \App\Services\ResearchTeamLeaderNotificationService::notifyOfficerAssigned($assignment);

        return response()->json([
            'success' => true,
            'message' => 'Officer assigned successfully',
            'data' => $assignment->load(['assignedBy', 'assignedTo']),
        ]);
    }

    /**
     * Get assignments for a research idea
     */
    public function getAssignments(ResearchIdea $researchIdea)
    {
        $assignments = $researchIdea->assignments()
            ->with(['assignedBy', 'assignedTo'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $assignments,
        ]);
    }

    /**
     * Accept an assignment
     */
    public function acceptAssignment(Request $request, ResearchAssignment $assignment)
    {
        $user = $request->user();

        try {
            $assignment->accept($user);

            return response()->json([
                'success' => true,
                'message' => 'Assignment accepted successfully',
                'data' => $assignment->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Start working on an assignment
     */
    public function startAssignment(Request $request, ResearchAssignment $assignment)
    {
        $user = $request->user();

        try {
            $assignment->start($user);

            return response()->json([
                'success' => true,
                'message' => 'Assignment started successfully',
                'data' => $assignment->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Complete an assignment
     */
    public function completeAssignment(Request $request, ResearchAssignment $assignment)
    {
        $user = $request->user();

        try {
            $assignment->complete($user);

            return response()->json([
                'success' => true,
                'message' => 'Assignment completed successfully',
                'data' => $assignment->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get Technology Clearance Certificate / Decision summary for a request.
     */
    public function getClearanceCertificate(ResearchIdea $researchIdea)
    {
        return response()->json([
            'success' => true,
            'data' => $researchIdea->getClearanceCertificate(),
        ]);
    }
}

