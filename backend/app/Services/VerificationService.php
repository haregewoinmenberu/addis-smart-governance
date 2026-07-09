<?php

namespace App\Services;

use App\Models\LicenseApplication;
use App\Models\VerificationRequest;
use App\Enums\VerificationType;
use App\Enums\VerificationStatus;
use Illuminate\Support\Facades\DB;

class VerificationService
{
    /**
     * Create verification requests for application
     */
    public function createVerificationRequests(LicenseApplication $application): array
    {
        $verifications = [];
        $requiredVerifications = [
            VerificationType::IDENTITY,
            VerificationType::EDUCATION,
            VerificationType::BACKGROUND,
        ];

        // Add additional verifications based on application data
        if ($application->experience_years > 0) {
            $requiredVerifications[] = VerificationType::EXPERIENCE;
        }

        if ($application->previous_license_number) {
            $requiredVerifications[] = VerificationType::PROFESSIONAL_HISTORY;
        }

        DB::beginTransaction();
        try {
            foreach ($requiredVerifications as $type) {
                $verification = VerificationRequest::create([
                    'application_id' => $application->id,
                    'verification_type' => $type,
                    'status' => VerificationStatus::PENDING,
                    'requested_at' => now(),
                ]);

                $verifications[] = $verification;
            }

            DB::commit();
            return $verifications;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Assign verifier to verification request
     */
    public function assignVerifier(
        VerificationRequest $verification,
        $verifierId,
        ?string $organization = null
    ): bool {
        return $verification->update([
            'verifier_id' => $verifierId,
            'verifier_organization' => $organization,
        ]);
    }

    /**
     * Complete verification
     */
    public function completeVerification(
        VerificationRequest $verification,
        VerificationStatus $status,
        ?string $comments = null,
        ?array $evidence = null
    ): bool {
        return $verification->update([
            'status' => $status,
            'comments' => $comments,
            'evidence' => $evidence,
            'completed_at' => now(),
        ]);
    }

    /**
     * Check if all verifications are complete
     */
    public function areAllVerificationsComplete(LicenseApplication $application): bool
    {
        $totalVerifications = $application->verificationRequests()->count();
        $completedVerifications = $application->verificationRequests()
            ->where('status', VerificationStatus::VERIFIED)
            ->count();

        return $totalVerifications > 0 && $totalVerifications === $completedVerifications;
    }

    /**
     * Get verification summary for application
     */
    public function getVerificationSummary(LicenseApplication $application): array
    {
        $verifications = $application->verificationRequests;

        $summary = [
            'total' => $verifications->count(),
            'pending' => $verifications->where('status', VerificationStatus::PENDING)->count(),
            'verified' => $verifications->where('status', VerificationStatus::VERIFIED)->count(),
            'failed' => $verifications->where('status', VerificationStatus::FAILED)->count(),
            'requires_correction' => $verifications->where('status', VerificationStatus::REQUIRES_CORRECTION)->count(),
            'is_complete' => false,
            'by_type' => [],
        ];

        foreach (VerificationType::cases() as $type) {
            $verification = $verifications->where('verification_type', $type)->first();
            if ($verification) {
                $summary['by_type'][$type->value] = [
                    'status' => $verification->status->value,
                    'label' => $verification->status->label(),
                    'completed_at' => $verification->completed_at?->format('Y-m-d H:i:s'),
                ];
            }
        }

        $summary['is_complete'] = $summary['verified'] === $summary['total'] && $summary['total'] > 0;

        return $summary;
    }
}
