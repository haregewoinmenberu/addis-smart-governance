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
use Illuminate\Support\Facades\Storage;

class ResearchWorkflowController extends Controller
{
    /**
     * Get workflow stages configuration
     * Optionally filtered by request type: ?type=system_request|infrastructure_request|security_related_request
     */
    public function getStages(Request $request)
    {
        $requestType = $request->query('type'); // one of ResearchWorkflowStage research_type values, or null (all)

        $query = ResearchWorkflowStage::active()->ordered()->with('creator');

        // If a request type is given, return stages for that type + universal stages
        if ($requestType && in_array($requestType, ['system_request', 'infrastructure_request', 'security_related_request'])) {
            $query->where(function ($q) use ($requestType) {
                $q->where('research_type', 'all')
                  ->orWhere('research_type', $requestType);
            });
        }

        $stages = $query->get();

        return response()->json([
            'success' => true,
            'data' => $stages,
        ]);
    }

    /**
     * Validate the incoming stage payload (shared by store/update), including
     * the dynamic form_fields array — Laravel's wildcard conditional rules
     * don't reliably enforce "options required when type=select", so that
     * part is checked manually.
     */
    private function validateStagePayload(Request $request, bool $isUpdate = false): array
    {
        $validated = $request->validate([
            'name' => ($isUpdate ? 'sometimes|' : '') . 'required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:0',
            'research_type' => 'nullable|in:all,system_request,infrastructure_request,security_related_request',
            'fillable_by_role' => 'nullable|in:research_director,research_team_leader,research_officer',
            'is_required' => 'boolean',
            'requires_approval' => 'boolean',
            'is_active' => 'boolean',
            'form_fields' => 'nullable|array',
            'form_fields.*.name' => 'required|string',
            'form_fields.*.label' => 'required|string',
            'form_fields.*.type' => 'required|in:text,textarea,number,select,checkbox,file',
            'form_fields.*.required' => 'boolean',
            'form_fields.*.hint' => 'nullable|string',
            'form_fields.*.options' => 'nullable|array',
            'form_fields.*.options.*.value' => 'required_with:form_fields.*.options|string',
            'form_fields.*.options.*.label' => 'required_with:form_fields.*.options|string',
        ]);

        $errors = [];
        foreach ($validated['form_fields'] ?? [] as $index => $field) {
            if ($field['type'] === 'select' && empty($field['options'])) {
                $errors["form_fields.{$index}.options"] = ["Field \"{$field['label']}\" is a select field and needs at least one option."];
            }
        }
        if (!empty($errors)) {
            throw \Illuminate\Validation\ValidationException::withMessages($errors);
        }

        return $validated;
    }

    /**
     * Create a new workflow stage.
     * Only research directors and smart city staff can create stages.
     */
    public function storeStage(Request $request)
    {
        $user = $request->user();
        
        // Verify user has permission to create workflow stages
        $canCreateStages = $user->hasRole('research_director') 
            || $user->hasRole('smart_city_sector_head')
            || $user->hasRole('smart_city_command')
            || $user->hasRole('bureau_head')
            || $user->hasRole('itdb_administrator');
            
        if (!$canCreateStages) {
            return response()->json([
                'success' => false,
                'message' => 'Only Research Directors and Smart City staff can create workflow stages',
            ], 403);
        }

        $validated = $this->validateStagePayload($request);

        $slug = \Illuminate\Support\Str::slug($validated['name'], '_');
        $originalSlug = $slug;
        $suffix = 1;
        while (ResearchWorkflowStage::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '_' . (++$suffix);
        }

        $stage = ResearchWorkflowStage::create([
            ...$validated,
            'slug' => $slug,
            'research_type' => $validated['research_type'] ?? 'all',
            'is_required' => $validated['is_required'] ?? true,
            'requires_approval' => $validated['requires_approval'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
            'order' => $validated['order'] ?? ((ResearchWorkflowStage::max('order') ?? 0) + 1),
            'created_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Workflow stage created successfully',
            'data' => $stage->load('creator'),
        ], 201);
    }

    /**
     * Update an existing workflow stage. The slug is immutable — nothing
     * else keys off it besides the one hardcoded lookup in
     * getClearanceCertificate(), and changing it post-creation is never
     * necessary for a stage that already has real progress records.
     */
    public function updateStage(Request $request, ResearchWorkflowStage $stage)
    {
        $validated = $this->validateStagePayload($request, isUpdate: true);

        $stage->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Workflow stage updated successfully',
            'data' => $stage->fresh(),
        ]);
    }

    /**
     * Delete a workflow stage — blocked if any research idea has already
     * progressed through it, to avoid orphaning ResearchWorkflowProgress
     * rows. Deactivating (is_active=false) is the safe alternative.
     */
    public function destroyStage(ResearchWorkflowStage $stage)
    {
        if ($stage->progress()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'This stage already has progress recorded against it and cannot be deleted. Deactivate it instead.',
            ], 409);
        }

        $stage->delete();

        return response()->json([
            'success' => true,
            'message' => 'Workflow stage deleted successfully',
        ]);
    }

    /**
     * Reorder stages. Accepts an ordered array of stage IDs and assigns
     * `order` to match array position.
     */
    public function reorderStages(Request $request)
    {
        $validated = $request->validate([
            'stage_ids' => 'required|array',
            'stage_ids.*' => 'required|integer|exists:research_workflow_stages,id',
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['stage_ids'] as $position => $stageId) {
                ResearchWorkflowStage::where('id', $stageId)->update(['order' => $position + 1]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Stages reordered successfully',
            'data' => ResearchWorkflowStage::ordered()->get(),
        ]);
    }

    /**
     * Get single workflow progress
     */
    public function getProgressItem(Request $request, ResearchWorkflowProgress $progress)
    {
        $progress->load(['stage', 'assignedUser', 'completedBy', 'reviews.reviewer']);

        $user = $request->user();
        $progress->setAttribute('can_work', $progress->canBeWorkedOnBy($user));
        $progress->setAttribute('can_review', $progress->canBeReviewedBy($user));

        return response()->json([
            'success' => true,
            'data' => $progress,
        ]);
    }

    /**
     * Get workflow progress for a research idea
     */
    public function getProgress(ResearchIdea $researchIdea)
    {
        $progress = $researchIdea->workflowProgress()
            ->with([
                'stage.creator',
                'assignedUser',
                'completedBy',
                'reviews.reviewer'
            ])
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

        // Determine request type from category (system_request / infrastructure_request / security_related_request)
        $requestType = $researchIdea->getRequestType();

        // Load only stages applicable to this request type
        $stages = ResearchWorkflowStage::active()->ordered()
            ->where(function ($q) use ($requestType) {
                $q->where('research_type', 'all')
                  ->orWhere('research_type', $requestType);
            })
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

        $normalizedStageData = \App\Services\ResearchStageFormValidator::validate($progress->stage, $validated['stage_data']);

        $progress->submit($user, $normalizedStageData);

        if ($validated['notes'] ?? null) {
            $progress->update(['notes' => $validated['notes']]);
        }

        // Send notification to team leader if this is an officer submission
        if ($user->hasRole('research_officer')) {
            \App\Services\ResearchTeamLeaderNotificationService::notifyOfficerSubmission($progress);
        }

        return response()->json([
            'success' => true,
            'message' => 'Stage submitted successfully',
            'data' => $progress->fresh()->load(['stage', 'assignedUser']),
        ]);
    }

    /**
     * Upload a file for one dynamic form field on a workflow stage, ahead of
     * submitting the stage. Returns a path reference to embed in stage_data.
     */
    public function uploadStageFile(Request $request, ResearchWorkflowProgress $progress)
    {
        $user = $request->user();

        if (!$progress->canBeWorkedOnBy($user)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to upload files for this stage',
            ], 403);
        }

        $request->validate([
            'file' => 'required|file|max:10240',
            'field_name' => 'required|string',
        ]);

        $file = $request->file('file');
        $fieldName = $request->input('field_name');
        $path = $file->store('research-workflow/' . $progress->id . '/' . $fieldName, 'public');

        // Surface this in the request's unified Documents tab too, not just
        // inside this stage's own stage_data — previously only attachments
        // from the initial submission were visible there. Re-uploads for the
        // same stage+field replace the earlier attachment rather than piling up.
        $fieldLabel = collect($progress->stage->form_fields ?? [])
            ->firstWhere('name', $fieldName)['label'] ?? $fieldName;

        $attachment = \App\Models\ResearchIdeaAttachment::where('workflow_progress_id', $progress->id)
            ->where('field_name', $fieldName)
            ->first();

        if ($attachment) {
            // Update existing attachment - track editor
            $attachment->update([
                'file_name' => $progress->stage->name . ' — ' . $fieldLabel . ': ' . $file->getClientOriginalName(),
                'file_path' => $path,
                'file_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'edited_by' => $user->id,
                'edited_at' => now(),
            ]);
        } else {
            // Create new attachment
            $attachment = \App\Models\ResearchIdeaAttachment::create([
                'research_idea_id' => $progress->research_idea_id,
                'workflow_progress_id' => $progress->id,
                'field_name' => $fieldName,
                'file_name' => $progress->stage->name . ' — ' . $fieldLabel . ': ' . $file->getClientOriginalName(),
                'file_path' => $path,
                'file_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'uploaded_by' => $user->id,
            ]);
        }

        \App\Services\ResearchAuditService::logWorkflowChange(
            $progress,
            $user,
            'uploaded a file for'
        );

        return response()->json([
            'success' => true,
            'data' => [
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime' => $file->getMimeType(),
            ],
        ]);
    }

    /**
     * Download a file previously uploaded for one of this stage's dynamic
     * form fields. The requested path must actually be referenced in this
     * stage's own stage_data, to prevent access to unrelated stored files.
     */
    public function downloadStageFile(Request $request, ResearchWorkflowProgress $progress)
    {
        $user = $request->user();

        $isAdmin = $user->hasRole('itdb_administrator') || $user->hasRole('bureau_head');
        $isResearchDirector = $user->hasRole('research_director');
        $isAssignedTeamLeader = $user->hasRole('research_team_leader') && ResearchAssignment::where('research_idea_id', $progress->research_idea_id)
            ->where('assigned_to', $user->id)
            ->where('assignment_type', 'team_leader')
            ->whereIn('status', ['accepted', 'in_progress'])
            ->exists();

        if (!$progress->canBeWorkedOnBy($user) && !$isAdmin && !$isResearchDirector && !$isAssignedTeamLeader) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to access this file',
            ], 403);
        }

        $path = $request->query('path');
        $referencedPaths = collect($progress->stage_data ?? [])
            ->map(fn ($value) => is_array($value) ? ($value['path'] ?? null) : null)
            ->filter()
            ->values();

        if (!$path || !$referencedPaths->contains($path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found for this stage',
            ], 404);
        }

        if (!Storage::disk('public')->exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        return response()->file(storage_path('app/public/' . $path));
    }

    /**
     * Assign a specific officer to work on this specific stage (rather than
     * the whole request). The officer must already have an officer-type
     * ResearchAssignment on this research idea — this narrows which of the
     * already-assigned officers is responsible for this particular stage,
     * it doesn't grant new hierarchy access. Once set, canBeWorkedOnBy()
     * locks the stage to exactly this officer.
     */
    public function assignStageOfficer(Request $request, ResearchWorkflowProgress $progress)
    {
        $user = $request->user();

        if (in_array($progress->status, ['completed', 'approved'])) {
            return response()->json([
                'success' => false,
                'message' => 'This stage is already completed and cannot be reassigned',
            ], 422);
        }

        $isAdmin = $user->hasRole('itdb_administrator') || $user->hasRole('bureau_head');
        $isResearchDirector = $user->hasRole('research_director');
        $isAssignedTeamLeader = $user->hasRole('research_team_leader') && ResearchAssignment::where('research_idea_id', $progress->research_idea_id)
            ->where('assigned_to', $user->id)
            ->where('assignment_type', 'team_leader')
            ->whereIn('status', ['accepted', 'in_progress'])
            ->exists();

        if (!$isAdmin && !$isResearchDirector && !$isAssignedTeamLeader) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to assign officers on this request',
            ], 403);
        }

        $validated = $request->validate([
            'officer_id' => 'required|exists:users,id',
        ]);

        $isAssignedOfficer = ResearchAssignment::where('research_idea_id', $progress->research_idea_id)
            ->where('assigned_to', $validated['officer_id'])
            ->where('assignment_type', 'officer')
            ->whereIn('status', ['pending', 'accepted', 'in_progress'])
            ->exists();

        if (!$isAssignedOfficer) {
            return response()->json([
                'success' => false,
                'message' => 'This officer must already be assigned to the request before being assigned to a specific stage',
            ], 422);
        }

        $stageRole = $progress->stage->fillable_by_role;
        if ($stageRole && $stageRole !== 'research_officer') {
            return response()->json([
                'success' => false,
                'message' => 'This stage is restricted to a different role and cannot be assigned to an officer',
            ], 422);
        }

        $progress->update(['assigned_to' => $validated['officer_id']]);

        \App\Services\ResearchAuditService::logWorkflowChange($progress, $user, 'assigned officer to');

        return response()->json([
            'success' => true,
            'message' => 'Officer assigned to stage successfully',
            'data' => $progress->fresh()->load(['stage', 'assignedUser']),
        ]);
    }

    /**
     * Review a workflow stage (approve/reject/request revision)
     */
    public function reviewStage(Request $request, ResearchWorkflowProgress $progress)
    {
        $user = $request->user();

        if (!$user->hasPermission('review_research_stage')) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to review stages',
            ], 403);
        }

        if (!$progress->stage->requires_approval) {
            return response()->json([
                'success' => false,
                'message' => 'This stage does not require approval',
            ], 422);
        }

        if ($progress->status !== 'pending_review') {
            return response()->json([
                'success' => false,
                'message' => 'Stage is not pending review',
            ], 422);
        }

        // Full eligibility rule (role + assignment + no-self-approval) lives
        // in ResearchWorkflowProgress::canBeReviewedBy(), shared with the
        // getProgressItem() response so the frontend Review page can gate
        // itself the same way instead of only finding out via this 403.
        if (!$progress->canBeReviewedBy($user)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to review this stage',
            ], 403);
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

