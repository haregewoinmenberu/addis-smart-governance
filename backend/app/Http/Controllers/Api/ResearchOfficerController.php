<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchIdea;
use App\Models\ResearchAssignment;
use App\Models\ResearchWorkflowProgress;
use Illuminate\Http\Request;

class ResearchOfficerController extends Controller
{
    /**
     * Get Officer Dashboard data
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();

        // All research ideas assigned to this officer
        $assignedIdeaIds = ResearchAssignment::where('assigned_to', $user->id)
            ->where('assignment_type', 'officer')
            ->whereIn('status', ['pending', 'accepted', 'in_progress'])
            ->pluck('research_idea_id');

        // Total assigned
        $totalAssigned = $assignedIdeaIds->count();

        // Active (in_progress) assignments
        $activeCount = ResearchAssignment::where('assigned_to', $user->id)
            ->where('assignment_type', 'officer')
            ->where('status', 'in_progress')
            ->count();

        // Pending acceptance
        $pendingCount = ResearchAssignment::where('assigned_to', $user->id)
            ->where('assignment_type', 'officer')
            ->where('status', 'pending')
            ->count();

        // Completed assignments
        $completedCount = ResearchAssignment::where('assigned_to', $user->id)
            ->where('assignment_type', 'officer')
            ->where('status', 'completed')
            ->count();

        // Stages I need to work on
        $pendingStages = ResearchWorkflowProgress::whereIn('research_idea_id', $assignedIdeaIds)
            ->where('assigned_to', $user->id)
            ->whereIn('status', ['not_started', 'in_progress'])
            ->with(['stage:id,name,stage_order', 'researchIdea:id,title,research_category'])
            ->latest()
            ->take(10)
            ->get()
            ->map(fn ($p) => [
                'id'         => $p->id,
                'stage_name' => $p->stage?->name,
                'status'     => $p->status,
                'research_id'    => $p->research_idea_id,
                'research_title' => $p->researchIdea?->title,
                'category'       => $p->researchIdea?->research_category,
                'started_at'     => $p->started_at,
            ]);

        // Stages submitted for review
        $submittedCount = ResearchWorkflowProgress::whereIn('research_idea_id', $assignedIdeaIds)
            ->where('assigned_to', $user->id)
            ->where('status', 'pending_review')
            ->count();

        // Stages that were revision-requested
        $revisionCount = ResearchWorkflowProgress::whereIn('research_idea_id', $assignedIdeaIds)
            ->where('assigned_to', $user->id)
            ->where('status', 'revision_requested')
            ->count();

        // Recent assigned evaluations
        $recentAssignments = ResearchAssignment::where('assigned_to', $user->id)
            ->where('assignment_type', 'officer')
            ->with(['researchIdea:id,title,research_category,status,priority'])
            ->latest()
            ->take(8)
            ->get()
            ->map(fn ($a) => [
                'assignment_id'  => $a->id,
                'status'         => $a->status,
                'research_id'    => $a->research_idea_id,
                'research_title' => $a->researchIdea?->title,
                'category'       => $a->researchIdea?->research_category,
                'idea_status'    => $a->researchIdea?->status,
                'priority'       => $a->researchIdea?->priority,
                'assigned_at'    => $a->created_at,
            ]);

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id'   => $user->id,
                    'name' => $user->name,
                    'role' => 'Technical Evaluation Officer',
                ],
                'stats' => [
                    'total_assigned'    => $totalAssigned,
                    'active'            => $activeCount,
                    'pending_acceptance'=> $pendingCount,
                    'completed'         => $completedCount,
                    'pending_stages'    => $pendingStages->count(),
                    'submitted_stages'  => $submittedCount,
                    'revision_stages'   => $revisionCount,
                ],
                'pending_stages'      => $pendingStages,
                'recent_assignments'  => $recentAssignments,
            ],
        ]);
    }

    /**
     * Get all assignments for the logged-in officer
     */
    public function myAssignments(Request $request)
    {
        $user   = $request->user();
        $status = $request->query('status');

        $query = ResearchAssignment::where('assigned_to', $user->id)
            ->where('assignment_type', 'officer')
            ->with([
                'researchIdea:id,title,research_category,status,priority,submitted_at',
                'assignedBy:id,name',
            ]);

        if ($status) {
            $query->where('status', $status);
        }

        $assignments = $query->latest()->paginate(15);

        return response()->json([
            'success' => true,
            'data'    => $assignments,
        ]);
    }

    /**
     * Get workflow stages for a specific idea assigned to the officer
     */
    public function myStages(Request $request, $ideaId)
    {
        $user = $request->user();

        // Verify officer is assigned to this idea
        $isAssigned = ResearchAssignment::where('research_idea_id', $ideaId)
            ->where('assigned_to', $user->id)
            ->where('assignment_type', 'officer')
            ->whereIn('status', ['pending', 'accepted', 'in_progress'])
            ->exists();

        if (!$isAssigned) {
            return response()->json([
                'success' => false,
                'message' => 'You are not assigned to this evaluation request.',
            ], 403);
        }

        $stages = ResearchWorkflowProgress::where('research_idea_id', $ideaId)
            ->with(['stage', 'assignedUser:id,name'])
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $stages,
        ]);
    }

    /**
     * Accept a pending assignment
     */
    public function acceptAssignment(Request $request, ResearchAssignment $assignment)
    {
        $user = $request->user();

        if ($assignment->assigned_to !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        if ($assignment->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Assignment is not pending.'], 422);
        }

        $assignment->update(['status' => 'accepted']);

        return response()->json([
            'success' => true,
            'message' => 'Assignment accepted successfully.',
            'data'    => $assignment->fresh(),
        ]);
    }

    /**
     * Get all submissions (pending_review stages) by the officer
     */
    public function mySubmissions(Request $request)
    {
        $user = $request->user();

        $assignedIdeaIds = ResearchAssignment::where('assigned_to', $user->id)
            ->where('assignment_type', 'officer')
            ->pluck('research_idea_id');

        $submissions = ResearchWorkflowProgress::whereIn('research_idea_id', $assignedIdeaIds)
            ->where('assigned_to', $user->id)
            ->whereIn('status', ['pending_review', 'approved', 'revision_requested', 'rejected'])
            ->with(['stage:id,name', 'researchIdea:id,title,research_category'])
            ->latest('submitted_at')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data'    => $submissions,
        ]);
    }
}
