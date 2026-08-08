<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchIdea;
use App\Models\ResearchAssignment;
use App\Models\ResearchWorkflowProgress;
use App\Models\User;
use Illuminate\Http\Request;

class ResearchDirectorController extends Controller
{
    /**
     * Get Research Director Dashboard Statistics
     */
    public function getStats(Request $request)
    {
        $user = $request->user();

        // Verify user is a research director
        if (!$user->hasRole('research_director')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        // Total requests
        $totalRequests = ResearchIdea::count();

        // Pending assignment (submitted but not assigned to team leader)
        $pendingAssignment = ResearchIdea::whereIn('status', ['submitted', 'under_review'])
            ->whereDoesntHave('assignments', function($q) {
                $q->where('assignment_type', 'team_leader')
                  ->whereIn('status', ['pending', 'accepted', 'in_progress']);
            })
            ->count();

        // Under evaluation (has active assignments)
        $underEvaluation = ResearchIdea::whereHas('assignments', function($q) {
            $q->whereIn('status', ['accepted', 'in_progress']);
        })->count();

        // Completed
        $completed = ResearchIdea::where('status', 'completed')->count();

        // Approved
        $approved = ResearchIdea::where('status', 'approved')->count();

        // Rejected
        $rejected = ResearchIdea::where('status', 'rejected')->count();

        // Team leaders count
        $teamLeaders = User::whereHas('roles', function($q) {
            $q->where('name', 'research_team_leader');
        })->count();

        // Officers count
        $officers = User::whereHas('roles', function($q) {
            $q->where('name', 'research_officer');
        })->count();

        // Active stages (in progress)
        $activeStages = ResearchWorkflowProgress::whereIn('status', ['in_progress', 'not_started'])
            ->count();

        // Pending reviews (submitted stages waiting for review)
        $pendingReviews = ResearchWorkflowProgress::where('status', 'pending_review')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_requests' => $totalRequests,
                'pending_assignment' => $pendingAssignment,
                'under_evaluation' => $underEvaluation,
                'completed' => $completed,
                'approved' => $approved,
                'rejected' => $rejected,
                'team_leaders' => $teamLeaders,
                'officers' => $officers,
                'active_stages' => $activeStages,
                'pending_reviews' => $pendingReviews,
            ],
        ]);
    }
}
