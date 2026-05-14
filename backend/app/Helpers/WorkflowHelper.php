<?php

namespace App\Helpers;

use App\Models\WorkflowInstance;
use App\Models\User;

class WorkflowHelper
{
    /**
     * Get workflow status badge color.
     */
    public static function getStatusColor(string $status): string
    {
        return match ($status) {
            'in_progress' => 'blue',
            'approved' => 'green',
            'rejected' => 'red',
            'revision_requested' => 'yellow',
            'cancelled' => 'gray',
            default => 'gray',
        };
    }

    /**
     * Get workflow status display name.
     */
    public static function getStatusDisplayName(string $status): string
    {
        return match ($status) {
            'in_progress' => 'In Progress',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            'revision_requested' => 'Revision Requested',
            'cancelled' => 'Cancelled',
            'pending' => 'Pending',
            default => ucfirst(str_replace('_', ' ', $status)),
        };
    }

    /**
     * Get approval action badge color.
     */
    public static function getActionColor(string $action): string
    {
        return match ($action) {
            'approved' => 'green',
            'rejected' => 'red',
            'revision_requested' => 'yellow',
            'pending' => 'blue',
            default => 'gray',
        };
    }

    /**
     * Get approval action display name.
     */
    public static function getActionDisplayName(string $action): string
    {
        return match ($action) {
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            'revision_requested' => 'Revision Requested',
            'pending' => 'Pending',
            default => ucfirst(str_replace('_', ' ', $action)),
        };
    }

    /**
     * Calculate workflow progress percentage.
     */
    public static function calculateProgress(WorkflowInstance $instance): int
    {
        $totalStages = count($instance->definition->stages);
        $currentStageIndex = $instance->current_stage_index;

        if ($instance->status === 'approved') {
            return 100;
        }

        if ($instance->status === 'rejected' || $instance->status === 'cancelled') {
            return 0;
        }

        return (int) (($currentStageIndex / $totalStages) * 100);
    }

    /**
     * Get next approver role for workflow.
     */
    public static function getNextApproverRole(WorkflowInstance $instance): ?string
    {
        if ($instance->status !== 'in_progress') {
            return null;
        }

        $currentStage = $instance->definition->getStage($instance->current_stage);
        return $currentStage['required_role'] ?? null;
    }

    /**
     * Get users who can approve current stage.
     */
    public static function getEligibleApprovers(WorkflowInstance $instance)
    {
        $role = self::getNextApproverRole($instance);
        
        if (!$role) {
            return collect();
        }

        return User::whereHas('roles', function ($query) use ($role) {
            $query->where('name', $role);
        })->where('is_active', true)->get();
    }

    /**
     * Check if user can approve workflow.
     */
    public static function canUserApprove(WorkflowInstance $instance, User $user): bool
    {
        if ($instance->status !== 'in_progress') {
            return false;
        }

        $requiredRole = self::getNextApproverRole($instance);
        
        if (!$requiredRole) {
            return false;
        }

        return $user->hasRole($requiredRole);
    }

    /**
     * Get workflow timeline data.
     */
    public static function getTimeline(WorkflowInstance $instance): array
    {
        $timeline = [];

        // Started
        $timeline[] = [
            'stage' => 'Workflow Started',
            'action' => 'started',
            'timestamp' => $instance->started_at,
            'user' => null,
            'comments' => null,
        ];

        // Approvals
        foreach ($instance->approvals as $approval) {
            $timeline[] = [
                'stage' => $approval->stage_name,
                'action' => $approval->action,
                'timestamp' => $approval->actioned_at ?? $approval->created_at,
                'user' => $approval->approver,
                'comments' => $approval->comments,
            ];
        }

        // Completed
        if ($instance->completed_at) {
            $timeline[] = [
                'stage' => 'Workflow Completed',
                'action' => $instance->status,
                'timestamp' => $instance->completed_at,
                'user' => null,
                'comments' => null,
            ];
        }

        return $timeline;
    }

    /**
     * Get workflow statistics for a user.
     */
    public static function getUserStatistics(User $user): array
    {
        $query = WorkflowInstance::query();

        // Filter based on user role
        if ($user->isSubCityUser()) {
            $query->whereHas('workflowable', function ($q) use ($user) {
                $q->where('submitted_by', $user->id);
            });
        }

        $total = $query->count();
        $inProgress = (clone $query)->where('status', 'in_progress')->count();
        $approved = (clone $query)->where('status', 'approved')->count();
        $rejected = (clone $query)->where('status', 'rejected')->count();

        return [
            'total' => $total,
            'in_progress' => $inProgress,
            'approved' => $approved,
            'rejected' => $rejected,
            'approval_rate' => $total > 0 ? round(($approved / $total) * 100, 2) : 0,
        ];
    }

    /**
     * Get pending approvals count for user.
     */
    public static function getPendingApprovalsCount(User $user): int
    {
        if (!$user->canApproveWorkflows()) {
            return 0;
        }

        $userRoles = $user->roles->pluck('name')->toArray();

        return WorkflowInstance::where('status', 'in_progress')
            ->get()
            ->filter(function ($instance) use ($userRoles) {
                $currentStage = $instance->definition->getStage($instance->current_stage);
                $requiredRole = $currentStage['required_role'] ?? null;
                return $requiredRole && in_array($requiredRole, $userRoles);
            })
            ->count();
    }

    /**
     * Format duration between two timestamps.
     */
    public static function formatDuration($start, $end = null): string
    {
        if (!$start) {
            return 'N/A';
        }

        $end = $end ?? now();
        $diff = $start->diff($end);

        if ($diff->days > 0) {
            return $diff->days . ' day' . ($diff->days > 1 ? 's' : '');
        }

        if ($diff->h > 0) {
            return $diff->h . ' hour' . ($diff->h > 1 ? 's' : '');
        }

        if ($diff->i > 0) {
            return $diff->i . ' minute' . ($diff->i > 1 ? 's' : '');
        }

        return 'Just now';
    }

    /**
     * Get workflow stage icon.
     */
    public static function getStageIcon(string $stageName): string
    {
        return match ($stageName) {
            'initial_review' => '📋',
            'duplication_analysis' => '🔍',
            'feasibility_study' => '📊',
            'budget_approval' => '💰',
            'final_approval' => '✅',
            default => '📌',
        };
    }

    /**
     * Get risk level from score.
     */
    public static function getRiskLevel(float $score): array
    {
        if ($score >= 80) {
            return ['level' => 'low', 'color' => 'green', 'label' => 'Low Risk'];
        } elseif ($score >= 50) {
            return ['level' => 'medium', 'color' => 'yellow', 'label' => 'Medium Risk'];
        } else {
            return ['level' => 'high', 'color' => 'red', 'label' => 'High Risk'];
        }
    }

    /**
     * Get similarity level from score.
     */
    public static function getSimilarityLevel(float $score): array
    {
        if ($score >= 80) {
            return ['level' => 'high', 'color' => 'red', 'label' => 'High Duplication'];
        } elseif ($score >= 50) {
            return ['level' => 'medium', 'color' => 'yellow', 'label' => 'Medium Duplication'];
        } else {
            return ['level' => 'low', 'color' => 'green', 'label' => 'Low Duplication'];
        }
    }

    /**
     * Get recommendation badge.
     */
    public static function getRecommendationBadge(string $recommendation): array
    {
        return match ($recommendation) {
            'reuse' => ['color' => 'red', 'label' => 'Recommend Reuse'],
            'extend' => ['color' => 'yellow', 'label' => 'Recommend Extend'],
            'new' => ['color' => 'green', 'label' => 'Proceed as New'],
            default => ['color' => 'gray', 'label' => ucfirst($recommendation)],
        };
    }
}
