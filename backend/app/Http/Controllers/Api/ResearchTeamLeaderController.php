<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchIdea;
use App\Models\ResearchAssignment;
use App\Models\ResearchWorkflowProgress;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ResearchTeamLeaderController extends Controller
{
    /**
     * Get Team Leader Dashboard Data
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();

        // Get all research assigned to this team leader
        $assignedResearch = ResearchAssignment::where('assigned_to', $user->id)
            ->where('assignment_type', 'team_leader')
            ->whereIn('status', ['accepted', 'in_progress'])
            ->pluck('research_idea_id');

        // Assigned Research Count
        $assignedCount = $assignedResearch->count();

        // Active Research (in progress)
        $activeCount = ResearchIdea::whereIn('id', $assignedResearch)
            ->whereIn('status', ['approved', 'under_review'])
            ->count();

        // Pending Officer Assignments (assigned research without officer assignments)
        $pendingOfficerAssignments = ResearchIdea::whereIn('id', $assignedResearch)
            ->whereDoesntHave('assignments', function ($query) use ($user) {
                $query->where('assignment_type', 'officer')
                    ->where('assigned_by', $user->id);
            })
            ->count();

        // Pending Reviews (officer submissions pending team leader review)
        $pendingReviews = ResearchWorkflowProgress::whereHas('researchIdea', function ($query) use ($assignedResearch) {
                $query->whereIn('id', $assignedResearch);
            })
            ->where('status', 'pending_review')
            ->whereHas('stage', function ($query) {
                $query->where('approver_role', 'research_team_leader');
            })
            ->count();

        // Completed Research
        $completedCount = ResearchIdea::whereIn('id', $assignedResearch)
            ->where('status', 'approved')
            ->whereHas('assignments', function ($query) use ($user) {
                $query->where('assigned_to', $user->id)
                    ->where('status', 'completed');
            })
            ->count();

        // Overdue Tasks
        $overdueCount = ResearchWorkflowProgress::whereHas('researchIdea', function ($query) use ($assignedResearch) {
                $query->whereIn('id', $assignedResearch);
            })
            ->whereIn('status', ['not_started', 'in_progress'])
            ->where('started_at', '<', now()->subDays(7)) // Overdue if started more than 7 days ago
            ->count();

        // Progress Summary
        $progressSummary = ResearchIdea::whereIn('id', $assignedResearch)
            ->with(['assignments' => function ($query) {
                $query->where('assignment_type', 'officer')
                    ->with('assignedTo:id,name');
            }])
            ->get()
            ->map(function ($research) {
                $progress = $research->getProgressPercentage();
                return [
                    'id' => $research->id,
                    'title' => $research->title,
                    'status' => $research->status,
                    'progress' => $progress,
                    'assigned_officers' => $research->assignments
                        ->pluck('assignedTo.name')
                        ->filter()
                        ->values()
                        ->toArray(),
                ];
            });

        // Recent Activities
        $recentActivities = DB::table('activity_log')
            ->where('subject_type', ResearchIdea::class)
            ->whereIn('subject_id', $assignedResearch)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($activity) {
                return [
                    'description' => $activity->description ?? 'Activity',
                    'user' => $activity->causer_id ? User::find($activity->causer_id)?->name : 'System',
                    'created_at' => $activity->created_at,
                ];
            });

        // Overdue Items Detail
        $overdueItems = ResearchWorkflowProgress::whereHas('researchIdea', function ($query) use ($assignedResearch) {
                $query->whereIn('id', $assignedResearch);
            })
            ->whereIn('status', ['not_started', 'in_progress'])
            ->where('started_at', '<', now()->subDays(7))
            ->with(['researchIdea:id,title', 'assignedUser:id,name', 'stage:id,name'])
            ->get()
            ->map(function ($progress) {
                return [
                    'id' => $progress->research_idea_id,
                    'title' => $progress->researchIdea->title,
                    'stage' => $progress->stage->name,
                    'assigned_to' => $progress->assignedUser?->name ?? 'Unassigned',
                    'due_date' => $progress->started_at->addDays(7)->toDateString(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'assigned_research' => $assignedCount,
                'active_research' => $activeCount,
                'pending_officer_assignments' => $pendingOfficerAssignments,
                'pending_reviews' => $pendingReviews,
                'completed_research' => $completedCount,
                'overdue_tasks' => $overdueCount,
                'progress_summary' => $progressSummary,
                'recent_activities' => $recentActivities,
                'overdue_items' => $overdueItems,
            ],
        ]);
    }

    /**
     * Get assigned research for team leader
     */
    public function assignedResearch(Request $request)
    {
        $user = $request->user();

        // Get research assignments for this team leader
        $assignments = ResearchAssignment::where('assigned_to', $user->id)
            ->where('assignment_type', 'team_leader')
            ->whereIn('status', ['pending', 'accepted', 'in_progress'])
            ->with([
                'researchIdea' => function ($query) {
                    $query->with(['submitter:id,name', 'assignedToDirector:id,name']);
                },
                'assignedBy:id,name',
            ])
            ->latest()
            ->get();

        // No need to filter by policy since we're already filtering by assignment
        // The query above already ensures only assigned research is returned
        
        return response()->json([
            'success' => true,
            'data' => $assignments->values(),
        ]);
    }

    /**
     * Get officer assignments for team leader's research
     */
    public function officerAssignments(Request $request)
    {
        $user = $request->user();

        // Get research where this team leader is assigned
        $teamLeaderResearch = ResearchAssignment::where('assigned_to', $user->id)
            ->where('assignment_type', 'team_leader')
            ->whereIn('status', ['accepted', 'in_progress'])
            ->pluck('research_idea_id');

        // Get officer assignments for those research items
        $officerAssignments = ResearchAssignment::whereIn('research_idea_id', $teamLeaderResearch)
            ->where('assignment_type', 'officer')
            ->where('assigned_by', $user->id)
            ->with([
                'researchIdea:id,title,status,priority',
                'assignedTo:id,name,email,department',
                'assignedBy:id,name',
            ])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $officerAssignments,
        ]);
    }

    /**
     * Get team members (research officers) created by this team leader
     * Only returns officers that were added/created by the authenticated team leader
     */
    public function teamMembers(Request $request)
    {
        $user = $request->user();

        // Get officers created by this team leader
        $officers = User::where('created_by', $user->id)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'like', '%research_officer%');
            })
            ->get();

        // Add workload information
        $officersWithWorkload = $officers->map(function ($officer) {
            $activeAssignments = ResearchAssignment::where('assigned_to', $officer->id)
                ->where('assignment_type', 'officer')
                ->whereIn('status', ['accepted', 'in_progress'])
                ->count();

            $completedAssignments = ResearchAssignment::where('assigned_to', $officer->id)
                ->where('assignment_type', 'officer')
                ->where('status', 'completed')
                ->count();

            return [
                'id' => $officer->id,
                'name' => $officer->name,
                'email' => $officer->email,
                'department' => $officer->department,
                'phone' => $officer->phone,
                'roles' => $officer->roles,
                'workload' => [
                    'active_assignments' => $activeAssignments,
                    'completed_assignments' => $completedAssignments,
                    'total_assignments' => $activeAssignments + $completedAssignments,
                ],
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $officersWithWorkload->values(),
        ]);
    }

    /**
     * Get pending reviews for team leader
     */
    public function pendingReviews(Request $request)
    {
        $user = $request->user();

        // Get research assigned to this team leader
        $assignedResearch = ResearchAssignment::where('assigned_to', $user->id)
            ->where('assignment_type', 'team_leader')
            ->whereIn('status', ['accepted', 'in_progress'])
            ->pluck('research_idea_id');

        // Get workflow stages pending review by team leader
        $pendingReviews = ResearchWorkflowProgress::whereHas('researchIdea', function ($query) use ($assignedResearch) {
                $query->whereIn('id', $assignedResearch);
            })
            ->where('status', 'pending_review')
            ->whereHas('stage', function ($query) {
                $query->where('approver_role', 'research_team_leader');
            })
            ->with([
                'researchIdea:id,title,status,priority',
                'stage:id,name,description,requires_approval',
                'assignedUser:id,name,email',
                'reviews' => function ($query) {
                    $query->latest()->with('reviewer:id,name');
                },
            ])
            ->latest('submitted_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $pendingReviews,
        ]);
    }
}
