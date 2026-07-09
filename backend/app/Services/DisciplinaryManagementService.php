<?php

namespace App\Services;

use App\Models\Complaint;
use App\Models\DisciplinaryCase;
use App\Models\DisciplinaryAction;
use App\Models\Hearing;
use App\Models\LicenseSuspension;
use App\Models\LicenseRevocation;
use App\Enums\ComplaintStatus;
use App\Enums\DisciplinaryAction as DisciplinaryActionEnum;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DisciplinaryManagementService
{
    protected $workflowService;

    public function __construct(LicensingWorkflowService $workflowService)
    {
        $this->workflowService = $workflowService;
    }

    /**
     * File a new complaint
     */
    public function fileComplaint(array $data, $filedBy = null): Complaint
    {
        DB::beginTransaction();
        try {
            $complaint = Complaint::create([
                'complaint_number' => $this->generateComplaintNumber(),
                'professional_id' => $data['professional_id'],
                'license_id' => $data['license_id'] ?? null,
                'filed_by' => $filedBy,
                'complainant_name' => $data['complainant_name'] ?? null,
                'complainant_email' => $data['complainant_email'] ?? null,
                'complainant_phone' => $data['complainant_phone'] ?? null,
                'is_anonymous' => $data['is_anonymous'] ?? false,
                'violation_type' => $data['violation_type'],
                'severity' => $data['severity'],
                'description' => $data['description'],
                'incident_date' => $data['incident_date'] ?? null,
                'incident_location' => $data['incident_location'] ?? null,
                'witnesses' => $data['witnesses'] ?? null,
                'evidence_files' => $data['evidence_files'] ?? null,
                'status' => ComplaintStatus::RECEIVED,
            ]);

            DB::commit();
            return $complaint;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Assign investigator to complaint
     */
    public function assignInvestigator(Complaint $complaint, $investigatorId, $userId): bool
    {
        DB::beginTransaction();
        try {
            $complaint->update([
                'assigned_investigator' => $investigatorId,
                'status' => ComplaintStatus::INVESTIGATING,
                'investigation_started_at' => now(),
            ]);

            $complaint->workflowHistory()->create([
                'user_id' => $userId,
                'from_stage' => ComplaintStatus::RECEIVED->value,
                'to_stage' => ComplaintStatus::INVESTIGATING->value,
                'action' => 'Investigator assigned',
                'metadata' => ['investigator_id' => $investigatorId],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Complete investigation and create disciplinary case
     */
    public function completeInvestigation(
        Complaint $complaint,
        string $summary,
        array $findings,
        array $evidence,
        $userId
    ): DisciplinaryCase {
        DB::beginTransaction();
        try {
            $complaint->update([
                'status' => ComplaintStatus::EVIDENCE_COLLECTION,
                'investigation_completed_at' => now(),
                'investigation_summary' => $summary,
            ]);

            // Create disciplinary case
            $case = DisciplinaryCase::create([
                'case_number' => $this->generateCaseNumber(),
                'complaint_id' => $complaint->id,
                'professional_id' => $complaint->professional_id,
                'license_id' => $complaint->license_id,
                'case_type' => 'complaint_based',
                'case_summary' => $summary,
                'violations' => [$complaint->violation_type->value],
                'status' => 'investigating',
                'lead_investigator' => $userId,
                'investigation_findings' => $findings,
                'evidence_collected' => $evidence,
                'investigation_completed_at' => now(),
            ]);

            DB::commit();
            return $case;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Schedule hearing
     */
    public function scheduleHearing(
        DisciplinaryCase $case,
        array $hearingData,
        $userId
    ): Hearing {
        DB::beginTransaction();
        try {
            $hearing = Hearing::create([
                'case_id' => $case->id,
                'professional_id' => $case->professional_id,
                'hearing_type' => $hearingData['hearing_type'],
                'scheduled_at' => $hearingData['scheduled_at'],
                'location' => $hearingData['location'] ?? null,
                'meeting_link' => $hearingData['meeting_link'] ?? null,
                'duration_minutes' => $hearingData['duration_minutes'] ?? 120,
                'committee_members' => $hearingData['committee_members'],
                'status' => 'scheduled',
            ]);

            $case->update([
                'status' => 'hearing_scheduled',
                'hearing_scheduled_at' => $hearingData['scheduled_at'],
            ]);

            DB::commit();
            return $hearing;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Record hearing decision
     */
    public function recordHearingDecision(
        Hearing $hearing,
        string $decision,
        array $recommendations,
        $userId
    ): bool {
        DB::beginTransaction();
        try {
            $hearing->update([
                'decision' => $decision,
                'recommendations' => $recommendations,
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            $hearing->case->update([
                'status' => 'decision_pending',
                'committee_decision' => $decision,
            ]);

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Impose disciplinary action
     */
    public function imposeDisciplinaryAction(
        DisciplinaryCase $case,
        array $actionData,
        $imposedBy
    ): DisciplinaryAction {
        DB::beginTransaction();
        try {
            $action = DisciplinaryAction::create([
                'case_id' => $case->id,
                'professional_id' => $case->professional_id,
                'license_id' => $case->license_id,
                'action_type' => $actionData['action_type'],
                'action_description' => $actionData['action_description'],
                'severity_level' => DisciplinaryActionEnum::from($actionData['action_type'])->severity(),
                'effective_date' => $actionData['effective_date'],
                'end_date' => $actionData['end_date'] ?? null,
                'is_permanent' => $actionData['is_permanent'] ?? false,
                'fine_amount' => $actionData['fine_amount'] ?? null,
                'training_course' => $actionData['training_course'] ?? null,
                'training_hours' => $actionData['training_hours'] ?? null,
                'practice_restrictions' => $actionData['practice_restrictions'] ?? null,
                'suspension_terms' => $actionData['suspension_terms'] ?? null,
                'imposed_by' => $imposedBy,
                'status' => 'active',
            ]);

            // Apply action to license if applicable
            if (in_array($actionData['action_type'], ['temporary_suspension', 'license_revocation'])) {
                $this->applyActionToLicense($action, $imposedBy);
            }

            $case->update([
                'status' => 'resolved',
                'is_resolved' => true,
                'resolved_at' => now(),
            ]);

            DB::commit();
            return $action;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Apply disciplinary action to license
     */
    protected function applyActionToLicense(DisciplinaryAction $action, $userId): void
    {
        $license = $action->license;
        
        if ($action->action_type->value === 'temporary_suspension') {
            LicenseSuspension::create([
                'license_id' => $license->id,
                'professional_id' => $action->professional_id,
                'disciplinary_action_id' => $action->id,
                'suspension_type' => 'temporary',
                'reason' => $action->action_description,
                'start_date' => $action->effective_date,
                'scheduled_end_date' => $action->end_date,
                'duration_days' => $action->effective_date->diffInDays($action->end_date),
                'suspended_by' => $userId,
                'status' => 'active',
            ]);

            $this->workflowService->suspendLicense($license, $userId, $action->action_description);
        }

        if ($action->action_type->value === 'license_revocation') {
            LicenseRevocation::create([
                'license_id' => $license->id,
                'professional_id' => $action->professional_id,
                'disciplinary_case_id' => $action->case_id,
                'revocation_type' => $action->is_permanent ? 'permanent' : 'temporary_with_reapplication',
                'reason' => $action->action_description,
                'legal_basis' => 'Disciplinary action',
                'revocation_date' => now(),
                'effective_date' => $action->effective_date,
                'revoked_by' => $userId,
                'status' => 'active',
            ]);

            $this->workflowService->revokeLicense($license, $userId, $action->action_description);
        }
    }

    /**
     * Dismiss complaint
     */
    public function dismissComplaint(Complaint $complaint, string $reason, $userId): bool
    {
        DB::beginTransaction();
        try {
            $complaint->update([
                'status' => ComplaintStatus::DISMISSED,
                'investigation_summary' => $reason,
            ]);

            $complaint->workflowHistory()->create([
                'user_id' => $userId,
                'from_stage' => $complaint->status->value,
                'to_stage' => ComplaintStatus::DISMISSED->value,
                'action' => 'Complaint dismissed',
                'comments' => $reason,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Generate unique complaint number
     */
    protected function generateComplaintNumber(): string
    {
        $year = now()->format('Y');
        $random = strtoupper(Str::random(6));
        return "COMP-{$year}-{$random}";
    }

    /**
     * Generate unique case number
     */
    protected function generateCaseNumber(): string
    {
        $year = now()->format('Y');
        $random = strtoupper(Str::random(6));
        return "CASE-{$year}-{$random}";
    }
}
