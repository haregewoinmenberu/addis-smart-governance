<?php

namespace App\Services;

use App\Models\WorkflowDefinition;
use App\Models\WorkflowInstance;
use App\Models\WorkflowApproval;
use App\Models\RequestItem;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\DB;

class WorkflowService
{
    /**
     * Initialize a workflow for an entity.
     */
    public function initializeWorkflow(string $workflowCode, $entity): WorkflowInstance
    {
        $workflow = WorkflowDefinition::where('code', $workflowCode)
            ->where('is_active', true)
            ->firstOrFail();

        return DB::transaction(function () use ($workflow, $entity) {
            // Create workflow instance
            $instance = WorkflowInstance::create([
                'workflow_definition_id' => $workflow->id,
                'workflowable_type' => get_class($entity),
                'workflowable_id' => $entity->id,
                'current_stage' => $workflow->stages[0]['name'],
                'current_stage_index' => 0,
                'status' => 'in_progress',
                'started_at' => now(),
            ]);

            // Create first approval record
            $instance->approvals()->create([
                'stage_name' => $workflow->stages[0]['name'],
                'stage_index' => 0,
                'action' => 'pending',
            ]);

            // Log activity
            ActivityLog::log('workflow_started', 'workflows', $instance);

            // Send notification to first approver
            $this->notifyStageApprover($instance);

            return $instance;
        });
    }

    /**
     * Approve current workflow stage.
     */
    public function approveStage(
        WorkflowInstance $instance,
        int $userId,
        ?string $comments = null,
        ?array $metadata = null
    ): WorkflowInstance {
        return DB::transaction(function () use ($instance, $userId, $comments, $metadata) {
            // Update current approval
            $approval = $instance->currentApproval();
            if ($approval) {
                $approval->update([
                    'approver_id' => $userId,
                    'action' => 'approved',
                    'comments' => $comments,
                    'metadata' => $metadata,
                    'actioned_at' => now(),
                ]);
            }

            // Get current stage configuration
            $currentStage = $instance->definition->getStage($instance->current_stage);

            // Check if should auto-advance
            if ($currentStage['auto_advance'] ?? false) {
                $this->advanceToNextStage($instance);
            }

            // Log activity
            ActivityLog::log('workflow_stage_approved', 'workflows', $instance, null, [
                'stage' => $instance->current_stage,
                'approver_id' => $userId,
            ]);

            return $instance->fresh(['definition', 'approvals.approver']);
        });
    }

    /**
     * Reject workflow.
     */
    public function rejectWorkflow(
        WorkflowInstance $instance,
        int $userId,
        string $comments,
        ?array $metadata = null
    ): WorkflowInstance {
        return DB::transaction(function () use ($instance, $userId, $comments, $metadata) {
            // Update current approval
            $approval = $instance->currentApproval();
            if ($approval) {
                $approval->update([
                    'approver_id' => $userId,
                    'action' => 'rejected',
                    'comments' => $comments,
                    'metadata' => $metadata,
                    'actioned_at' => now(),
                ]);
            }

            // Mark workflow as rejected
            $instance->reject();

            // Update related entity status
            if ($instance->workflowable instanceof RequestItem) {
                $instance->workflowable->update([
                    'status' => 'Rejected',
                    'approval_status' => 'rejected',
                ]);
            }

            // Log activity
            ActivityLog::log('workflow_rejected', 'workflows', $instance, null, [
                'stage' => $instance->current_stage,
                'approver_id' => $userId,
                'reason' => $comments,
            ]);

            // Notify submitter
            app(NotificationService::class)->notifyWorkflowRejected($instance, $comments);

            return $instance->fresh(['definition', 'approvals.approver']);
        });
    }

    /**
     * Request revision on workflow.
     */
    public function requestRevision(
        WorkflowInstance $instance,
        int $userId,
        string $comments,
        ?array $metadata = null
    ): WorkflowInstance {
        return DB::transaction(function () use ($instance, $userId, $comments, $metadata) {
            // Update current approval
            $approval = $instance->currentApproval();
            if ($approval) {
                $approval->update([
                    'approver_id' => $userId,
                    'action' => 'revision_requested',
                    'comments' => $comments,
                    'metadata' => $metadata,
                    'actioned_at' => now(),
                ]);
            }

            // Mark workflow as revision requested
            $instance->requestRevision();

            // Update related entity status
            if ($instance->workflowable instanceof RequestItem) {
                $instance->workflowable->update([
                    'status' => 'Revision Required',
                    'approval_status' => 'revision_requested',
                ]);
            }

            // Log activity
            ActivityLog::log('workflow_revision_requested', 'workflows', $instance, null, [
                'stage' => $instance->current_stage,
                'approver_id' => $userId,
                'reason' => $comments,
            ]);

            // Notify submitter
            app(NotificationService::class)->notifyRevisionRequested($instance, $comments);

            return $instance->fresh(['definition', 'approvals.approver']);
        });
    }

    /**
     * Resubmit workflow after revision.
     */
    public function resubmitWorkflow(WorkflowInstance $instance): WorkflowInstance
    {
        return DB::transaction(function () use ($instance) {
            // Reset to first stage
            $firstStage = $instance->definition->stages[0];

            $instance->update([
                'current_stage' => $firstStage['name'],
                'current_stage_index' => 0,
                'status' => 'in_progress',
            ]);

            // Create new approval record for first stage
            $instance->approvals()->create([
                'stage_name' => $firstStage['name'],
                'stage_index' => 0,
                'action' => 'pending',
            ]);

            // Update related entity status
            if ($instance->workflowable instanceof RequestItem) {
                $instance->workflowable->update([
                    'status' => 'Submitted',
                    'approval_status' => 'pending',
                    'step' => 1,
                ]);
            }

            // Log activity
            ActivityLog::log('workflow_resubmitted', 'workflows', $instance);

            // Notify first approver
            $this->notifyStageApprover($instance);

            return $instance->fresh(['definition', 'approvals.approver']);
        });
    }

    /**
     * Advance workflow to next stage.
     */
    public function advanceToNextStage(WorkflowInstance $instance): bool
    {
        $nextStage = $instance->definition->getNextStage($instance->current_stage);

        if (!$nextStage) {
            // No more stages, complete workflow
            $this->completeWorkflow($instance);
            return false;
        }

        $instance->update([
            'current_stage' => $nextStage['name'],
            'current_stage_index' => $nextStage['order'] - 1,
        ]);

        // Create approval record for next stage
        $instance->approvals()->create([
            'stage_name' => $nextStage['name'],
            'stage_index' => $nextStage['order'] - 1,
            'action' => 'pending',
        ]);

        // Update request step
        if ($instance->workflowable instanceof RequestItem) {
            $instance->workflowable->update([
                'step' => $nextStage['order'],
            ]);
        }

        // Log activity
        ActivityLog::log('workflow_stage_advanced', 'workflows', $instance, null, [
            'from_stage' => $instance->current_stage,
            'to_stage' => $nextStage['name'],
        ]);

        // Notify next approver
        $this->notifyStageApprover($instance);

        return true;
    }

    /**
     * Complete workflow.
     */
    public function completeWorkflow(WorkflowInstance $instance): void
    {
        $instance->complete();

        // Update related entity status
        if ($instance->workflowable instanceof RequestItem) {
            $instance->workflowable->update([
                'status' => 'Approved',
                'approval_status' => 'approved',
                'step' => $instance->workflowable->total_steps,
            ]);
        }

        // Log activity
        ActivityLog::log('workflow_completed', 'workflows', $instance);

        // Notify submitter
        app(NotificationService::class)->notifyWorkflowCompleted($instance);
    }

    /**
     * Cancel workflow.
     */
    public function cancelWorkflow(WorkflowInstance $instance, int $userId, string $reason): WorkflowInstance
    {
        return DB::transaction(function () use ($instance, $userId, $reason) {
            $instance->update([
                'status' => 'cancelled',
                'completed_at' => now(),
            ]);

            // Update related entity status
            if ($instance->workflowable instanceof RequestItem) {
                $instance->workflowable->update([
                    'status' => 'Cancelled',
                    'approval_status' => 'cancelled',
                ]);
            }

            // Log activity
            ActivityLog::log('workflow_cancelled', 'workflows', $instance, null, [
                'cancelled_by' => $userId,
                'reason' => $reason,
            ]);

            return $instance->fresh(['definition', 'approvals.approver']);
        });
    }

    /**
     * Get pending approvals for user.
     */
    public function getPendingApprovalsForUser(int $userId): \Illuminate\Database\Eloquent\Collection
    {
        $user = \App\Models\User::findOrFail($userId);
        $userRoles = $user->roles->pluck('name')->toArray();

        return WorkflowInstance::with(['definition', 'workflowable', 'approvals'])
            ->where('status', 'in_progress')
            ->get()
            ->filter(function ($instance) use ($userRoles) {
                $currentStage = $instance->definition->getStage($instance->current_stage);
                $requiredRole = $currentStage['required_role'] ?? null;

                return $requiredRole && in_array($requiredRole, $userRoles);
            });
    }

    /**
     * Check if user can approve current stage.
     */
    public function canUserApproveStage(WorkflowInstance $instance, int $userId): bool
    {
        $user = \App\Models\User::findOrFail($userId);
        $currentStage = $instance->definition->getStage($instance->current_stage);
        $requiredRole = $currentStage['required_role'] ?? null;

        if (!$requiredRole) {
            return true; // No role requirement
        }

        return $user->hasRole($requiredRole);
    }

    /**
     * Get workflow statistics.
     */
    public function getWorkflowStatistics(?string $workflowCode = null): array
    {
        $query = WorkflowInstance::query();

        if ($workflowCode) {
            $query->whereHas('definition', function ($q) use ($workflowCode) {
                $q->where('code', $workflowCode);
            });
        }

        $total = $query->count();
        $inProgress = (clone $query)->where('status', 'in_progress')->count();
        $approved = (clone $query)->where('status', 'approved')->count();
        $rejected = (clone $query)->where('status', 'rejected')->count();
        $revisionRequested = (clone $query)->where('status', 'revision_requested')->count();

        // Calculate average completion time
        $avgCompletionTime = (clone $query)
            ->whereNotNull('completed_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, started_at, completed_at)) as avg_hours')
            ->value('avg_hours');

        return [
            'total' => $total,
            'in_progress' => $inProgress,
            'approved' => $approved,
            'rejected' => $rejected,
            'revision_requested' => $revisionRequested,
            'approval_rate' => $total > 0 ? round(($approved / $total) * 100, 2) : 0,
            'avg_completion_hours' => round($avgCompletionTime ?? 0, 2),
        ];
    }

    /**
     * Notify stage approver.
     */
    protected function notifyStageApprover(WorkflowInstance $instance): void
    {
        $currentStage = $instance->definition->getStage($instance->current_stage);
        $requiredRole = $currentStage['required_role'] ?? null;

        if ($requiredRole) {
            app(NotificationService::class)->notifyStageApprovers($instance, $requiredRole);
        }
    }
}
