<?php

namespace App\Services;

use App\Models\LicenseApplication;
use App\Models\License;
use App\Models\LicensingWorkflowHistory;
use App\Enums\ApplicationStatus;
use App\Enums\LicenseStatus;
use Illuminate\Support\Facades\DB;

class LicensingWorkflowService
{
    /**
     * Submit application for review
     */
    public function submitApplication(LicenseApplication $application, $userId): bool
    {
        if (!$application->canSubmit()) {
            return false;
        }

        DB::beginTransaction();
        try {
            $application->update([
                'status' => ApplicationStatus::SUBMITTED,
                'submitted_at' => now(),
            ]);

            $this->recordWorkflowTransition(
                $application,
                $userId,
                ApplicationStatus::DRAFT->value,
                ApplicationStatus::SUBMITTED->value,
                'Application submitted for review'
            );

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Move application to review
     */
    public function startReview(LicenseApplication $application, $userId): bool
    {
        DB::beginTransaction();
        try {
            $application->update([
                'status' => ApplicationStatus::UNDER_REVIEW,
                'reviewed_by' => $userId,
            ]);

            $this->recordWorkflowTransition(
                $application,
                $userId,
                ApplicationStatus::SUBMITTED->value,
                ApplicationStatus::UNDER_REVIEW->value,
                'Application review started'
            );

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Approve application
     */
    public function approveApplication(LicenseApplication $application, $userId, ?string $comments = null): bool
    {
        if (!$application->canApprove()) {
            return false;
        }

        DB::beginTransaction();
        try {
            $application->update([
                'status' => ApplicationStatus::APPROVED,
                'approved_at' => now(),
                'reviewed_by' => $userId,
                'review_comments' => $comments,
            ]);

            $this->recordWorkflowTransition(
                $application,
                $userId,
                ApplicationStatus::UNDER_REVIEW->value,
                ApplicationStatus::APPROVED->value,
                'Application approved',
                ['comments' => $comments]
            );

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Reject application
     */
    public function rejectApplication(LicenseApplication $application, $userId, string $reason): bool
    {
        DB::beginTransaction();
        try {
            $application->update([
                'status' => ApplicationStatus::REJECTED,
                'rejected_at' => now(),
                'reviewed_by' => $userId,
                'review_comments' => $reason,
            ]);

            $this->recordWorkflowTransition(
                $application,
                $userId,
                $application->status->value,
                ApplicationStatus::REJECTED->value,
                'Application rejected',
                ['reason' => $reason]
            );

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Return application for correction
     */
    public function returnForCorrection(LicenseApplication $application, $userId, string $reason): bool
    {
        DB::beginTransaction();
        try {
            $application->update([
                'status' => ApplicationStatus::RETURNED,
                'reviewed_by' => $userId,
                'review_comments' => $reason,
            ]);

            $this->recordWorkflowTransition(
                $application,
                $userId,
                ApplicationStatus::UNDER_REVIEW->value,
                ApplicationStatus::RETURNED->value,
                'Application returned for correction',
                ['reason' => $reason]
            );

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Suspend license
     */
    public function suspendLicense(License $license, $userId, string $reason, array $details = []): bool
    {
        DB::beginTransaction();
        try {
            $previousStatus = $license->status;
            
            $license->update([
                'status' => LicenseStatus::SUSPENDED,
                'suspended_at' => now(),
                'status_reason' => $reason,
            ]);

            $this->recordWorkflowTransition(
                $license,
                $userId,
                $previousStatus->value,
                LicenseStatus::SUSPENDED->value,
                'License suspended',
                array_merge(['reason' => $reason], $details)
            );

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Revoke license
     */
    public function revokeLicense(License $license, $userId, string $reason, array $details = []): bool
    {
        DB::beginTransaction();
        try {
            $previousStatus = $license->status;
            
            $license->update([
                'status' => LicenseStatus::REVOKED,
                'revoked_at' => now(),
                'status_reason' => $reason,
            ]);

            $this->recordWorkflowTransition(
                $license,
                $userId,
                $previousStatus->value,
                LicenseStatus::REVOKED->value,
                'License revoked',
                array_merge(['reason' => $reason], $details)
            );

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Activate license
     */
    public function activateLicense(License $license, $userId): bool
    {
        DB::beginTransaction();
        try {
            $previousStatus = $license->status;
            
            $license->update([
                'status' => LicenseStatus::ACTIVE,
            ]);

            $this->recordWorkflowTransition(
                $license,
                $userId,
                $previousStatus->value,
                LicenseStatus::ACTIVE->value,
                'License activated'
            );

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Record workflow transition
     */
    protected function recordWorkflowTransition(
        $entity,
        $userId,
        ?string $fromStage,
        string $toStage,
        string $action,
        array $metadata = []
    ): void {
        LicensingWorkflowHistory::create([
            'entity_type' => get_class($entity),
            'entity_id' => $entity->id,
            'user_id' => $userId,
            'from_stage' => $fromStage,
            'to_stage' => $toStage,
            'action' => $action,
            'metadata' => $metadata,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
