<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchProject;
use App\Models\ProposalReview;
use App\Models\ResearchActivityLog;
use App\Enums\ApprovalDecision;
use Illuminate\Http\Request;

class ProposalReviewController extends Controller
{
    public function index(Request $request, ResearchProject $researchProject)
    {
        $reviews = $researchProject->proposalReviews()
            ->with('reviewer')
            ->latest()
            ->get();

        return response()->json($reviews);
    }

    public function store(Request $request, ResearchProject $researchProject)
    {
        $validated = $request->validate([
            'review_level' => 'required|string',
            'decision' => 'required|string',
            'comments' => 'required|string',
            'technical_score' => 'nullable|integer|min:0|max:100',
            'financial_score' => 'nullable|integer|min:0|max:100',
            'feasibility_score' => 'nullable|integer|min:0|max:100',
        ]);

        $validated['research_project_id'] = $researchProject->id;
        $validated['reviewer_id'] = auth()->id();
        $validated['reviewed_at'] = now();

        $review = ProposalReview::create($validated);

        // Check if all required reviews are complete
        $this->checkApprovalStatus($researchProject);

        ResearchActivityLog::log('reviewed', $researchProject, null, $validated, "Proposal review: {$validated['decision']}");

        return response()->json($review->load('reviewer'), 201);
    }

    public function show(ResearchProject $researchProject, ProposalReview $review)
    {
        return response()->json($review->load('reviewer'));
    }

    public function update(Request $request, ResearchProject $researchProject, ProposalReview $review)
    {
        // Only allow updates by the original reviewer
        if ($review->reviewer_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'decision' => 'sometimes|string',
            'comments' => 'sometimes|string',
            'technical_score' => 'nullable|integer|min:0|max:100',
            'financial_score' => 'nullable|integer|min:0|max:100',
            'feasibility_score' => 'nullable|integer|min:0|max:100',
        ]);

        $oldValues = $review->toArray();
        $review->update($validated);

        // Recheck approval status
        $this->checkApprovalStatus($researchProject);

        ResearchActivityLog::log('updated', $review, $oldValues, $validated, 'Proposal review updated');

        return response()->json($review->load('reviewer'));
    }

    public function destroy(ResearchProject $researchProject, ProposalReview $review)
    {
        // Only allow deletion by the original reviewer or admin
        if ($review->reviewer_id !== auth()->id() && !auth()->user()->hasRole('research_director')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        ResearchActivityLog::log('deleted', $review, $review->toArray(), null, 'Proposal review deleted');
        
        $review->delete();

        return response()->json(['message' => 'Review deleted successfully']);
    }

    public function pending(Request $request)
    {
        $reviews = ProposalReview::where('decision', 'pending')
            ->with(['researchProject', 'reviewer'])
            ->latest()
            ->paginate(20);

        return response()->json($reviews);
    }

    protected function checkApprovalStatus(ResearchProject $project)
    {
        $reviews = $project->proposalReviews;
        $requiredLevels = ['technical', 'financial', 'governance'];
        
        $approvedLevels = $reviews->filter(function($review) {
            return $review->decision === ApprovalDecision::APPROVED->value;
        })->pluck('review_level')->unique();
        
        $rejectedReviews = $reviews->where('decision', ApprovalDecision::REJECTED->value);
        
        if ($rejectedReviews->isNotEmpty()) {
            // Any rejection means the proposal is rejected
            $project->update(['approval_status' => 'rejected']);
        } elseif ($approvedLevels->count() >= count($requiredLevels)) {
            // All required levels approved
            $project->update(['approval_status' => 'approved']);
        } else {
            $project->update(['approval_status' => 'under_review']);
        }
    }
}
