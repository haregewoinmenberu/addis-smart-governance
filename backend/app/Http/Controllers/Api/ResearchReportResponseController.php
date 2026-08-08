<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\ResearchIdeaAttachment;
use App\Models\ResearchReportResponse;
use App\Models\ResearchWorkflowProgress;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ResearchReportResponseController extends Controller
{
    /**
     * Users eligible to receive a forward (any other sector/director with
     * visibility into research).
     */
    public function forwardTargets(Request $request)
    {
        $user = $request->user();

        $targets = User::whereHas('roles.permissions', function ($query) {
            $query->where('name', 'view_research');
        })
            ->where('id', '!=', $user->id)
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $targets,
        ]);
    }

    /**
     * Send the final decision to the original requester. The uploaded
     * certificate/letter IS the decision as far as the requester is
     * concerned — this is the only response type available when the
     * decision was 'rejected', since there's no next step to continue.
     */
    public function respondToRequester(Request $request, ResearchWorkflowProgress $progress)
    {
        $this->authorizeAccess($request, $progress);

        $validated = $request->validate([
            'certificate' => 'required|file|max:10240',
            'message' => 'required|string|min:10',
        ]);

        $researchIdea = $progress->researchIdea;
        $file = $request->file('certificate');
        $path = $file->store('research-report-responses/' . $progress->id, 'public');

        $response = ResearchReportResponse::create([
            'research_idea_id' => $researchIdea->id,
            'workflow_progress_id' => $progress->id,
            'responded_by' => $request->user()->id,
            'response_type' => 'requester',
            'certificate_path' => $path,
            'certificate_name' => $file->getClientOriginalName(),
            'message' => $validated['message'],
            'sent_at' => now(),
        ]);

        $notification = $this->notifyRequester($response, $progress, $researchIdea, $request->user());
        if ($notification) {
            $response->update(['notification_id' => $notification->id]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Response sent to requester successfully',
            'data' => $response->fresh()->load(['respondedBy', 'notification']),
        ]);
    }

    /**
     * Forward the approved request to another sector/director to continue
     * the process, with a letter/document for the recipient. Not available
     * when the decision was 'rejected' — there is no next step to hand off.
     */
    public function forward(Request $request, ResearchWorkflowProgress $progress)
    {
        $this->authorizeAccess($request, $progress);

        $decision = $progress->stage_data['decision'] ?? null;
        if ($decision === 'rejected') {
            return response()->json([
                'success' => false,
                'message' => 'A rejected request cannot be forwarded — only a response to the requester applies.',
            ], 422);
        }

        $validated = $request->validate([
            'forward_to_user_id' => 'required|exists:users,id',
            'letter' => 'required|file|max:10240',
            'message' => 'required|string|min:10',
        ]);

        $researchIdea = $progress->researchIdea;
        $file = $request->file('letter');
        $path = $file->store('research-report-responses/' . $progress->id, 'public');

        $response = ResearchReportResponse::create([
            'research_idea_id' => $researchIdea->id,
            'workflow_progress_id' => $progress->id,
            'responded_by' => $request->user()->id,
            'response_type' => 'forward',
            'certificate_path' => $path,
            'certificate_name' => $file->getClientOriginalName(),
            'message' => $validated['message'],
            'forwarded_to_user_id' => $validated['forward_to_user_id'],
            'sent_at' => now(),
        ]);

        $notification = $this->notifyForwardTarget($response, $progress, $researchIdea, $request->user());
        $response->update(['notification_id' => $notification->id]);

        return response()->json([
            'success' => true,
            'message' => 'Request forwarded successfully',
            'data' => $response->fresh()->load(['respondedBy', 'forwardedTo', 'notification']),
        ]);
    }

    /**
     * Re-send a response/forward that the recipient has not yet opened —
     * refreshes the notification so it surfaces again, without creating a
     * duplicate response record.
     */
    public function resend(Request $request, ResearchReportResponse $response)
    {
        abort_unless($request->user()->hasPermission('view_research'), 403, 'You do not have permission to resend responses');
        abort_unless($request->user()->id === $response->responded_by, 403, 'Only the original sender can resend this');

        if ($response->notification && $response->notification->read_at !== null) {
            return response()->json([
                'success' => false,
                'message' => 'The recipient has already seen this — nothing to resend.',
            ], 422);
        }

        $progress = $response->workflowProgress;
        $researchIdea = $response->researchIdea;

        if ($response->response_type === 'requester') {
            $notification = $this->notifyRequester($response, $progress, $researchIdea, $request->user());
        } else {
            $notification = $this->notifyForwardTarget($response, $progress, $researchIdea, $request->user());
        }

        if ($notification) {
            $response->update(['notification_id' => $notification->id, 'sent_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Resent successfully',
            'data' => $response->fresh()->load(['respondedBy', 'forwardedTo', 'notification']),
        ]);
    }

    /**
     * Get the response/forward history for a given report (progress row).
     */
    public function index(ResearchWorkflowProgress $progress)
    {
        $responses = ResearchReportResponse::where('workflow_progress_id', $progress->id)
            ->with(['respondedBy', 'forwardedTo', 'notification'])
            ->orderBy('sent_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $responses,
        ]);
    }

    /**
     * The requester-facing decision status for one research idea — lets the
     * original submitter see whether their finalized report is still
     * "Under Review" (Smart City approved the stage but hasn't sent a
     * decision response yet) or "Responded" (with the certificate).
     */
    public function statusForResearchIdea(Request $request, int $researchIdeaId)
    {
        $progress = ResearchWorkflowProgress::whereHas('stage', function ($query) {
            $query->where('slug', 'evaluation_summary_report');
        })
            ->where('research_idea_id', $researchIdeaId)
            ->where('status', 'approved')
            ->first();

        if (!$progress) {
            return response()->json([
                'success' => true,
                'data' => ['finalized' => false],
            ]);
        }

        $response = ResearchReportResponse::requesterResponses()
            ->where('workflow_progress_id', $progress->id)
            ->with('respondedBy')
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'finalized' => true,
                'decision' => $progress->stage_data['decision'] ?? null,
                'has_response' => (bool) $response,
                'response' => $response,
            ],
        ]);
    }

    /**
     * Requests forwarded to the current user by another sector/director, so
     * they have a way to pick up the process. Each forward carries the
     * letter, the forwarding message, and the director's final evaluation
     * document — everything the recipient needs without having to open the
     * full (permission-gated) research idea management page.
     */
    public function receivedForwards(Request $request)
    {
        $user = $request->user();

        $forwards = ResearchReportResponse::forwards()
            ->where('forwarded_to_user_id', $user->id)
            ->with(['respondedBy', 'researchIdea:id,title,summary,research_category', 'workflowProgress'])
            ->orderBy('sent_at', 'desc')
            ->get();

        $forwards->each(function (ResearchReportResponse $forward) {
            $decision = $forward->workflowProgress->stage_data['decision'] ?? null;
            $finalDocument = ResearchIdeaAttachment::where('workflow_progress_id', $forward->workflow_progress_id)
                ->where('field_name', 'final_document')
                ->first();

            $forward->setAttribute('decision', $decision);
            $forward->setAttribute('final_document', $finalDocument ? [
                'id' => $finalDocument->id,
                'file_name' => $finalDocument->file_name,
                'file_size' => $finalDocument->file_size,
            ] : null);
        });

        return response()->json([
            'success' => true,
            'data' => $forwards,
        ]);
    }

    /**
     * View a single response/forward — the page a recipient lands on via
     * the "See Response" notification action. Also marks the underlying
     * notification as read so the sender's Resend option deactivates.
     */
    public function showResponse(Request $request, ResearchReportResponse $response)
    {
        $user = $request->user();

        $isRecipient = $response->response_type === 'requester'
            ? $response->researchIdea->submitted_by === $user->id
            : $response->forwarded_to_user_id === $user->id;

        abort_unless($isRecipient || $user->hasPermission('view_research'), 403, 'You do not have access to this response');

        if ($isRecipient && $response->notification && $response->notification->read_at === null) {
            $response->notification->markAsRead();
        }

        $response->load(['respondedBy', 'forwardedTo', 'researchIdea', 'notification', 'workflowProgress']);

        $finalDocument = ResearchIdeaAttachment::where('workflow_progress_id', $response->workflow_progress_id)
            ->where('field_name', 'final_document')
            ->first();

        $response->setAttribute('decision', $response->workflowProgress->stage_data['decision'] ?? null);
        $response->setAttribute('final_document', $finalDocument ? [
            'id' => $finalDocument->id,
            'file_name' => $finalDocument->file_name,
            'file_size' => $finalDocument->file_size,
        ] : null);

        return response()->json([
            'success' => true,
            'data' => $response,
        ]);
    }

    /**
     * Download the certificate/letter attached to a response or forward.
     */
    public function downloadCertificate(ResearchReportResponse $response)
    {
        if (!$response->certificate_path || !Storage::disk('public')->exists($response->certificate_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found on server',
            ], 404);
        }

        return Storage::disk('public')->download($response->certificate_path, $response->certificate_name);
    }

    private function notifyRequester(
        ResearchReportResponse $response,
        ResearchWorkflowProgress $progress,
        $researchIdea,
        User $sender
    ): ?Notification {
        if (!$researchIdea->submitted_by) {
            return null;
        }

        return Notification::create([
            'user_id' => $researchIdea->submitted_by,
            'title' => 'Decision Issued for Your Request',
            'message' => $response->message,
            'type' => 'research_report_response',
            'channel' => 'in_app',
            'priority' => 'high',
            'action_url' => "/research/reports/responses/{$response->id}/view",
            'action_text' => 'See Response',
            'data' => [
                'research_id' => $researchIdea->id,
                'research_title' => $researchIdea->title,
                'decision' => $progress->stage_data['decision'] ?? null,
                'response_id' => $response->id,
                'responded_by' => $sender->name,
            ],
            'sent_at' => now(),
        ]);
    }

    private function notifyForwardTarget(
        ResearchReportResponse $response,
        ResearchWorkflowProgress $progress,
        $researchIdea,
        User $sender
    ): Notification {
        return Notification::create([
            'user_id' => $response->forwarded_to_user_id,
            'title' => 'Research Request Forwarded to You',
            'message' => $response->message,
            'type' => 'research_report_forward',
            'channel' => 'in_app',
            'priority' => 'high',
            'action_url' => "/research/reports/responses/{$response->id}/view",
            'action_text' => 'See Response',
            'data' => [
                'research_id' => $researchIdea->id,
                'research_title' => $researchIdea->title,
                'decision' => $progress->stage_data['decision'] ?? null,
                'response_id' => $response->id,
                'forwarded_by' => $sender->name,
            ],
            'sent_at' => now(),
        ]);
    }

    private function authorizeAccess(Request $request, ResearchWorkflowProgress $progress): void
    {
        abort_unless($request->user()->hasPermission('view_research'), 403, 'You do not have permission to respond to requesters');

        abort_if(
            $progress->stage->slug !== 'evaluation_summary_report' || $progress->status !== 'approved',
            422,
            'This report is not finalized yet'
        );
    }
}
