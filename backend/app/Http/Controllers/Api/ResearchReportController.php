<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchIdeaAttachment;
use App\Models\ResearchReportResponse;
use App\Models\ResearchWorkflowProgress;
use App\Models\ResearchWorkflowStage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ResearchReportController extends Controller
{
    /**
     * Get research reports dashboard with statistics and reports list.
     *
     * A "report" here is the Evaluation Summary Report stage: filled in by
     * the research director (fillable_by_role = research_director) and only
     * final once Smart City approves it (workflowProgress.status =
     * 'approved' — see ResearchStageReview::applyDecision(), which sets the
     * progress status to 'approved' once a director-filled stage — which
     * the director can't self-approve — is approved by Smart City).
     */
    public function index(Request $request)
    {
        $evaluationStage = ResearchWorkflowStage::where('slug', 'evaluation_summary_report')->first();

        if (!$evaluationStage) {
            return response()->json([
                'success' => false,
                'message' => 'Evaluation Summary Report stage not found',
            ], 404);
        }

        $completedProgress = ResearchWorkflowProgress::where('stage_id', $evaluationStage->id)
            ->where('status', 'approved')
            ->with([
                'researchIdea:id,title,summary,research_category,submitted_by,created_at',
                'researchIdea.submitter:id,name,email',
                'completedBy:id,name,email',
            ])
            ->orderBy('completed_at', 'desc')
            ->get();

        $reports = $completedProgress->map(function (ResearchWorkflowProgress $progress) {
            return $this->formatReport($progress);
        });

        $statistics = $this->calculateStatistics($reports);

        return response()->json([
            'success' => true,
            'data' => [
                'statistics' => $statistics,
                'reports' => $reports,
                'total' => $reports->count(),
            ],
        ]);
    }

    /**
     * Get a specific research report
     */
    public function show($id)
    {
        $progress = ResearchWorkflowProgress::with([
            'researchIdea',
            'researchIdea.submitter',
            'researchIdea.attachments',
            'completedBy',
            'stage',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $this->formatReport($progress, true),
        ]);
    }

    /**
     * Download final report document
     */
    public function downloadDocument($progressId, $documentId)
    {
        $attachment = ResearchIdeaAttachment::where('workflow_progress_id', $progressId)
            ->where('id', $documentId)
            ->first();

        if (!$attachment) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found',
            ], 404);
        }

        if (!Storage::disk('public')->exists($attachment->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found on server',
            ], 404);
        }

        return Storage::disk('public')->download($attachment->file_path, $attachment->file_name);
    }

    /**
     * Shape a completed Evaluation Summary Report stage into the dashboard's
     * report representation, pulling the director's decision/note out of
     * stage_data and the uploaded final document out of the attachments
     * table (keyed by workflow_progress_id + field_name).
     */
    private function formatReport(ResearchWorkflowProgress $progress, bool $withAllDocuments = false): array
    {
        $stageData = $progress->stage_data ?? [];
        $decision = $stageData['decision'] ?? 'unknown';
        $note = $stageData['note'] ?? '';

        $finalDocument = ResearchIdeaAttachment::where('workflow_progress_id', $progress->id)
            ->where('field_name', 'final_document')
            ->first();

        $hasRequesterResponse = ResearchReportResponse::where('workflow_progress_id', $progress->id)
            ->where('response_type', 'requester')
            ->exists();

        $hasForward = ResearchReportResponse::where('workflow_progress_id', $progress->id)
            ->where('response_type', 'forward')
            ->exists();

        $report = [
            'id' => $progress->id,
            'research_idea_id' => $progress->research_idea_id,
            'research_title' => $progress->researchIdea->title ?? 'Unknown',
            'research_summary' => $progress->researchIdea->summary ?? '',
            'research_category' => $progress->researchIdea->research_category ?? '',
            'submitter' => $progress->researchIdea->submitter->name ?? 'Unknown',
            'reviewer' => $progress->completedBy->name ?? 'Unknown',
            'reviewed_at' => $progress->completed_at,
            'decision' => $decision,
            'decision_label' => $this->getDecisionLabel($decision),
            'note' => $note,
            'final_document' => $finalDocument ? [
                'id' => $finalDocument->id,
                'file_name' => $finalDocument->file_name,
                'file_path' => $finalDocument->file_path,
                'file_size' => $finalDocument->file_size,
            ] : null,
            'has_requester_response' => $hasRequesterResponse,
            'has_forward' => $hasForward,
            'created_at' => $progress->researchIdea->created_at ?? null,
        ];

        if ($withAllDocuments) {
            $report['all_documents'] = ResearchIdeaAttachment::where('workflow_progress_id', $progress->id)->get();
            $report['stage'] = $progress->stage;
        }

        return $report;
    }

    /**
     * Calculate statistics by decision type
     */
    private function calculateStatistics($reports)
    {
        $decisionCounts = $reports->groupBy('decision')->map(function ($group) {
            return $group->count();
        });

        // Decision categories for dashboard
        $decisions = [
            'approved_to_develop' => 'Approved for Development',
            'transfer_existing' => 'Transfer Existing System',
            'customization_of_existing' => 'Customization of Existing',
            'infrastructure_upgrade' => 'Infrastructure Upgrade',
            'rejected' => 'Rejected',
            'needs_improvement' => 'Needs Improvement',
            'deferred' => 'Deferred',
            'pending' => 'Pending',
            'further_review_required' => 'Further Review Required',
            'resubmit_with_changes' => 'Resubmit with Changes',
            'approved_with_conditions' => 'Approved with Conditions',
            'approved_for_pilot' => 'Approved for Pilot',
            'approved_for_full_implementation' => 'Approved for Full Implementation',
            'approved_for_production' => 'Approved for Production',
            'no_risks' => 'No Risks Identified',
        ];

        $statistics = [];
        foreach ($decisions as $value => $label) {
            $statistics[] = [
                'decision' => $value,
                'label' => $label,
                'count' => $decisionCounts->get($value, 0),
            ];
        }

        // Calculate totals
        $totalReports = $reports->count();
        $approvedCount = $reports->filter(function ($report) {
            return in_array($report['decision'], [
                'approved_to_develop',
                'transfer_existing',
                'customization_of_existing',
                'infrastructure_upgrade',
                'approved_with_conditions',
                'approved_for_pilot',
                'approved_for_full_implementation',
                'approved_for_production',
            ]);
        })->count();

        $rejectedCount = $decisionCounts->get('rejected', 0);
        $pendingCount = $reports->filter(function ($report) {
            return in_array($report['decision'], [
                'pending',
                'needs_improvement',
                'further_review_required',
                'resubmit_with_changes',
                'deferred',
            ]);
        })->count();

        return [
            'total' => $totalReports,
            'approved' => $approvedCount,
            'rejected' => $rejectedCount,
            'pending' => $pendingCount,
            'by_decision' => $statistics,
        ];
    }

    /**
     * Get human-readable decision label
     */
    private function getDecisionLabel($decision)
    {
        $labels = [
            'approved_to_develop' => 'Approved for Development',
            'transfer_existing' => 'Approve Transfer Existing system/solution',
            'customization_of_existing' => 'Approve Customization of Existing Project',
            'infrastructure_upgrade' => 'Approve Infrastructure Upgrade',
            'rejected' => 'Rejected',
            'needs_improvement' => 'Needs Improvement',
            'deferred' => 'Deferred',
            'pending' => 'Pending',
            'further_review_required' => 'Further Review Required',
            'resubmit_with_changes' => 'Resubmit with Changes',
            'approved_with_conditions' => 'Approved with Conditions',
            'approved_for_pilot' => 'Approved for Pilot Implementation',
            'approved_for_full_implementation' => 'Approved for Full Implementation',
            'approved_for_production' => 'Approved for Production Deployment',
            'no_risks' => 'No Risks Identified',
        ];

        return $labels[$decision] ?? ucwords(str_replace('_', ' ', $decision));
    }
}
