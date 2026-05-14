<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Collection;

class NotificationService
{
    /**
     * Create a notification for a user.
     */
    public static function create(
        User $user,
        string $title,
        string $message,
        string $type = 'info',
        string $priority = 'normal',
        ?string $actionUrl = null,
        ?string $actionText = null,
        ?array $data = null,
        ?User $createdBy = null
    ): Notification {
        return Notification::create([
            'user_id' => $user->id,
            'created_by_id' => $createdBy?->id,
            'sub_city_id' => $user->sub_city_id,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'channel' => 'in_app',
            'priority' => $priority,
            'action_url' => $actionUrl,
            'action_text' => $actionText,
            'data' => $data,
            'sent_at' => now(),
        ]);
    }

    /**
     * Create notifications for multiple users.
     */
    public static function createForUsers(
        Collection $users,
        string $title,
        string $message,
        string $type = 'info',
        string $priority = 'normal',
        ?string $actionUrl = null,
        ?string $actionText = null,
        ?array $data = null,
        ?User $createdBy = null
    ): int {
        $count = 0;

        foreach ($users as $user) {
            self::create(
                $user,
                $title,
                $message,
                $type,
                $priority,
                $actionUrl,
                $actionText,
                $data,
                $createdBy
            );
            $count++;
        }

        return $count;
    }

    /**
     * Notify about new technology request.
     */
    public static function notifyNewRequest($request, User $submitter): void
    {
        // Notify approvers
        $approvers = User::whereHas('roles', function ($query) {
            $query->where('name', 'itdb_administrator');
        })->get();

        self::createForUsers(
            $approvers,
            'New Technology Request',
            "{$submitter->name} submitted a new technology request: {$request->title}",
            'request',
            'normal',
            "/requests/{$request->id}",
            'View Request',
            ['request_id' => $request->id],
            $submitter
        );
    }

    /**
     * Notify about request approval.
     */
    public static function notifyRequestApproved($request, User $approver): void
    {
        if ($request->submittedBy) {
            self::create(
                $request->submittedBy,
                'Request Approved',
                "Your technology request '{$request->title}' has been approved.",
                'success',
                'high',
                "/requests/{$request->id}",
                'View Request',
                ['request_id' => $request->id],
                $approver
            );
        }
    }

    /**
     * Notify about request rejection.
     */
    public static function notifyRequestRejected($request, User $rejector, ?string $reason = null): void
    {
        if ($request->submittedBy) {
            $message = "Your technology request '{$request->title}' has been rejected.";
            if ($reason) {
                $message .= " Reason: {$reason}";
            }

            self::create(
                $request->submittedBy,
                'Request Rejected',
                $message,
                'error',
                'high',
                "/requests/{$request->id}",
                'View Request',
                ['request_id' => $request->id, 'reason' => $reason],
                $rejector
            );
        }
    }

    /**
     * Notify about audit scheduled.
     */
    public static function notifyAuditScheduled($audit, User $scheduler): void
    {
        // Notify sub-city admin
        if ($audit->subCity && $audit->subCity->administrator) {
            self::create(
                $audit->subCity->administrator,
                'Audit Scheduled',
                "An audit has been scheduled for {$audit->subCity->name} on {$audit->scheduled_date->format('M d, Y')}.",
                'audit',
                'high',
                "/audits/{$audit->id}",
                'View Audit',
                ['audit_id' => $audit->id],
                $scheduler
            );
        }
    }

    /**
     * Notify about cybersecurity issue.
     */
    public static function notifyCybersecurityIssue($issue, User $reporter): void
    {
        // Notify ITDB admins
        $admins = User::whereHas('roles', function ($query) {
            $query->where('name', 'itdb_administrator');
        })->get();

        $priorityLabel = strtoupper($issue->severity);

        self::createForUsers(
            $admins,
            "Cybersecurity Alert: {$priorityLabel}",
            "{$reporter->name} reported a {$issue->severity} severity cybersecurity issue: {$issue->title}",
            'security',
            $issue->severity === 'critical' ? 'urgent' : 'high',
            "/cybersecurity/{$issue->id}",
            'View Issue',
            ['issue_id' => $issue->id, 'severity' => $issue->severity],
            $reporter
        );
    }

    /**
     * Notify about vendor approval.
     */
    public static function notifyVendorApproved($vendor, User $approver): void
    {
        // Notify sub-city admin who added the vendor
        if ($vendor->createdBy) {
            self::create(
                $vendor->createdBy,
                'Vendor Approved',
                "Vendor '{$vendor->name}' has been approved and is now active.",
                'success',
                'normal',
                "/vendors/{$vendor->id}",
                'View Vendor',
                ['vendor_id' => $vendor->id],
                $approver
            );
        }
    }

    /**
     * Notify about workflow escalation.
     */
    public static function notifyWorkflowEscalated($workflow, User $escalatedTo): void
    {
        self::create(
            $escalatedTo,
            'Workflow Escalated',
            "A workflow has been escalated to you for approval: {$workflow->title}",
            'workflow',
            'urgent',
            "/workflows/instances/{$workflow->id}",
            'Review Now',
            ['workflow_id' => $workflow->id],
            null
        );
    }

    /**
     * Notify about system maintenance.
     */
    public static function notifySystemMaintenance(string $message, \DateTime $scheduledTime): void
    {
        $allUsers = User::where('is_active', true)->get();

        self::createForUsers(
            $allUsers,
            'System Maintenance Scheduled',
            $message,
            'system',
            'high',
            null,
            null,
            ['scheduled_time' => $scheduledTime->format('Y-m-d H:i:s')]
        );
    }

    /**
     * Send welcome notification to new user.
     */
    public static function sendWelcomeNotification(User $user): void
    {
        self::create(
            $user,
            'Welcome to STRP',
            "Welcome to the Smart Technology Request Portal! Your account has been created successfully.",
            'info',
            'normal',
            '/profile',
            'Complete Profile'
        );
    }

    /**
     * Notify about password expiration.
     */
    public static function notifyPasswordExpiring(User $user, int $daysRemaining): void
    {
        self::create(
            $user,
            'Password Expiring Soon',
            "Your password will expire in {$daysRemaining} days. Please change it to maintain account security.",
            'warning',
            'high',
            '/profile?tab=security',
            'Change Password'
        );
    }

    /**
     * Notify stage approvers about pending workflow.
     */
    public static function notifyStageApprovers($instance, string $roleName): void
    {
        $users = User::whereHas('roles', function ($query) use ($roleName) {
            $query->where('name', $roleName);
        })->get();

        $entity = $instance->workflowable;
        $stageName = $instance->definition->getStage($instance->current_stage)['display_name'] ?? $instance->current_stage;

        $title = "Approval Required: {$stageName}";
        $message = "A workflow requires your approval at stage: {$stageName}";

        if ($entity instanceof \App\Models\RequestItem) {
            $message .= "\n\nRequest: {$entity->title}";
            $message .= "\nOffice: {$entity->office}";
            $message .= "\nBudget: " . number_format($entity->budget, 2);
        }

        self::createForUsers(
            $users,
            $title,
            $message,
            'workflow_approval',
            'high',
            "/workflows/instances/{$instance->id}",
            'Review Now',
            [
                'workflow_instance_id' => $instance->id,
                'stage' => $instance->current_stage,
            ]
        );
    }

    /**
     * Notify workflow completed.
     */
    public static function notifyWorkflowCompleted($instance): void
    {
        $entity = $instance->workflowable;

        if ($entity instanceof \App\Models\RequestItem && $entity->submittedBy) {
            self::create(
                $entity->submittedBy,
                'Request Approved',
                "Your request '{$entity->title}' has been approved and completed all workflow stages.",
                'success',
                'high',
                "/requests/{$entity->id}",
                'View Request',
                [
                    'workflow_instance_id' => $instance->id,
                    'request_id' => $entity->id,
                ]
            );
        }
    }

    /**
     * Notify workflow rejected.
     */
    public static function notifyWorkflowRejected($instance, string $reason): void
    {
        $entity = $instance->workflowable;

        if ($entity instanceof \App\Models\RequestItem && $entity->submittedBy) {
            self::create(
                $entity->submittedBy,
                'Request Rejected',
                "Your request '{$entity->title}' has been rejected.\n\nReason: {$reason}",
                'error',
                'high',
                "/requests/{$entity->id}",
                'View Details',
                [
                    'workflow_instance_id' => $instance->id,
                    'request_id' => $entity->id,
                    'reason' => $reason,
                ]
            );
        }
    }

    /**
     * Notify revision requested.
     */
    public static function notifyRevisionRequested($instance, string $comments): void
    {
        $entity = $instance->workflowable;

        if ($entity instanceof \App\Models\RequestItem && $entity->submittedBy) {
            self::create(
                $entity->submittedBy,
                'Revision Required',
                "Your request '{$entity->title}' requires revision.\n\nComments: {$comments}",
                'warning',
                'high',
                "/requests/{$entity->id}/edit",
                'Revise Request',
                [
                    'workflow_instance_id' => $instance->id,
                    'request_id' => $entity->id,
                    'comments' => $comments,
                ]
            );
        }
    }

    /**
     * Notify high duplication detected.
     */
    public static function notifyHighDuplication($request, $case): void
    {
        if ($request->submittedBy) {
            $technology = $case->existingTechnology;
            $message = "High duplication detected for your request '{$request->title}'.\n\n";
            $message .= "Similar Technology: {$technology->name}\n";
            $message .= "Similarity Score: {$case->similarity_score}%\n";
            $message .= "Recommendation: " . strtoupper($case->recommendation);

            self::create(
                $request->submittedBy,
                'Duplication Alert',
                $message,
                'warning',
                'high',
                "/requests/{$request->id}/duplication",
                'View Analysis',
                [
                    'request_id' => $request->id,
                    'duplication_case_id' => $case->id,
                ]
            );
        }

        // Also notify ITDB administrators
        $admins = User::whereHas('roles', function ($query) {
            $query->where('name', 'itdb_administrator');
        })->get();

        self::createForUsers(
            $admins,
            'High Duplication Detected',
            "Request '{$request->title}' from {$request->office} shows {$case->similarity_score}% similarity to existing technology.",
            'info',
            'normal',
            "/requests/{$request->id}",
            'Review',
            [
                'request_id' => $request->id,
                'duplication_case_id' => $case->id,
            ]
        );
    }

    /**
     * Notify high risk evaluation.
     */
    public static function notifyHighRiskEvaluation($request, $study): void
    {
        // Notify submitter
        if ($request->submittedBy) {
            self::create(
                $request->submittedBy,
                'High Risk Assessment',
                "Your request '{$request->title}' has received a high-risk feasibility assessment (Score: {$study->overall_risk_score}/100). Please review the evaluation details.",
                'warning',
                'high',
                "/requests/{$request->id}/feasibility",
                'View Evaluation',
                [
                    'request_id' => $request->id,
                    'feasibility_study_id' => $study->id,
                ]
            );
        }

        // Notify ITDB administrators for escalation
        $admins = User::whereHas('roles', function ($query) {
            $query->where('name', 'itdb_administrator');
        })->get();

        self::createForUsers(
            $admins,
            'High Risk Request Requires Review',
            "Request '{$request->title}' from {$request->office} has a high-risk feasibility score ({$study->overall_risk_score}/100). Immediate review recommended.",
            'error',
            'urgent',
            "/requests/{$request->id}",
            'Review Now',
            [
                'request_id' => $request->id,
                'feasibility_study_id' => $study->id,
                'priority' => 'high',
            ]
        );
    }
}
