<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchProject;
use App\Models\ResearchIdea;
use App\Models\ResearchActivityLog;
use App\Services\ResearchWorkflowService;
use App\Enums\ResearchStage;
use Illuminate\Http\Request;

class ResearchProjectController extends Controller
{
    protected $workflowService;

    public function __construct(ResearchWorkflowService $workflowService)
    {
        $this->workflowService = $workflowService;
    }

    public function index(Request $request)
    {
        $query = ResearchProject::with(['researchIdea', 'projectLead']);

        if ($request->stage) {
            $query->where('current_stage', $request->stage);
        }

        if ($request->lead_id) {
            $query->where('project_lead_id', $request->lead_id);
        }

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('project_code', 'like', "%{$request->search}%");
            });
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'research_idea_id' => 'required|exists:research_ideas,id',
            'title' => 'required|string|max:255',
            'background' => 'nullable|string',
            'objectives' => 'nullable|string',
            'methodology' => 'nullable|string',
            'expected_deliverables' => 'nullable|string',
            'estimated_budget' => 'nullable|numeric',
            'required_resources' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'risk_analysis' => 'nullable|string',
            'success_metrics' => 'nullable|string',
            'project_lead_id' => 'nullable|exists:users,id',
        ]);

        $validated['current_stage'] = ResearchStage::PROPOSAL_DEVELOPMENT;

        $project = ResearchProject::create($validated);

        ResearchActivityLog::log('created', $project, null, $validated, 'Research project created');

        return response()->json($project->load(['researchIdea', 'projectLead']), 201);
    }

    public function show(ResearchProject $researchProject)
    {
        return response()->json($researchProject->load([
            'researchIdea',
            'projectLead',
            'currentProposalVersion',
            'milestones',
            'tasks',
            'teamMembers.user',
            'workflowHistory.transitioner'
        ]));
    }

    public function update(Request $request, ResearchProject $researchProject)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'background' => 'nullable|string',
            'objectives' => 'nullable|string',
            'methodology' => 'nullable|string',
            'expected_deliverables' => 'nullable|string',
            'estimated_budget' => 'nullable|numeric',
            'required_resources' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'risk_analysis' => 'nullable|string',
            'success_metrics' => 'nullable|string',
            'project_lead_id' => 'nullable|exists:users,id',
            'progress_percentage' => 'nullable|integer|min:0|max:100',
        ]);

        $oldValues = $researchProject->toArray();
        $researchProject->update($validated);

        ResearchActivityLog::log('updated', $researchProject, $oldValues, $validated, 'Research project updated');

        return response()->json($researchProject->load(['researchIdea', 'projectLead']));
    }

    public function destroy(ResearchProject $researchProject)
    {
        ResearchActivityLog::log('deleted', $researchProject, $researchProject->toArray(), null, 'Research project deleted');
        
        $researchProject->delete();

        return response()->json(['message' => 'Research project deleted successfully']);
    }

    public function transitionStage(Request $request, ResearchProject $researchProject)
    {
        $validated = $request->validate([
            'to_stage' => 'required|string',
            'reason' => 'nullable|string',
        ]);

        try {
            $toStage = ResearchStage::from($validated['to_stage']);
            $this->workflowService->transitionStage($researchProject, $toStage, $validated['reason'] ?? null);

            ResearchActivityLog::log('transitioned', $researchProject, null, $validated, "Stage transitioned to {$toStage->label()}");

            return response()->json([
                'message' => 'Stage transitioned successfully',
                'project' => $researchProject->fresh()->load('workflowHistory')
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function rollback(Request $request, ResearchProject $researchProject)
    {
        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        try {
            $this->workflowService->rollback($researchProject, $validated['reason']);

            ResearchActivityLog::log('rollback', $researchProject, null, $validated, "Stage rolled back");

            return response()->json([
                'message' => 'Stage rolled back successfully',
                'project' => $researchProject->fresh()->load('workflowHistory')
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function availableTransitions(ResearchProject $researchProject)
    {
        return response()->json([
            'transitions' => $this->workflowService->getAvailableTransitions($researchProject)
        ]);
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();
        
        // Base stats
        $stats = [
            'user_role' => $user->roles->first()?->name ?? 'none',
            'user_permissions' => $user->getAllPermissions(),
        ];

        // Director & Lead: Full system overview
        if ($user->hasAnyPermission(['view-research-analytics', 'manage-research-projects'])) {
            $stats['total_projects'] = ResearchProject::count();
            $stats['total_ideas'] = \App\Models\ResearchIdea::count();
            $stats['pending_screenings'] = \App\Models\ResearchIdea::where('status', 'submitted')->count();
            
            $stats['by_stage'] = ResearchProject::selectRaw('current_stage, count(*) as count')
                ->groupBy('current_stage')
                ->get()
                ->map(function($item) {
                    return [
                        'stage' => $item->current_stage,
                        'label' => $item->current_stage->label(),
                        'count' => $item->count
                    ];
                });
            
            $stats['by_priority'] = \App\Models\ResearchIdea::selectRaw('priority, count(*) as count')
                ->groupBy('priority')
                ->get();
            
            $stats['active_projects'] = ResearchProject::where('current_stage', ResearchStage::EXECUTION)->count();
            $stats['completed_evaluations'] = ResearchProject::where('current_stage', ResearchStage::EVALUATION)->count();
            $stats['technology_transfers'] = ResearchProject::where('current_stage', ResearchStage::TECHNOLOGY_TRANSFER)->count();
            
            // Budget overview
            $stats['total_budget'] = ResearchProject::sum('estimated_budget');
            $stats['avg_progress'] = (float) ResearchProject::avg('progress_percentage');
            
            // Recent activities
            $stats['recent_ideas'] = \App\Models\ResearchIdea::with('submitter')
                ->latest()
                ->take(5)
                ->get();
            
            $stats['recent_projects'] = ResearchProject::with('projectLead')
                ->latest()
                ->take(5)
                ->get();
        }
        
        // Research Lead: Own projects and team
        if ($user->hasRole('research_lead')) {
            $stats['my_projects'] = ResearchProject::where('project_lead_id', $user->id)->count();
            $stats['my_active_projects'] = ResearchProject::where('project_lead_id', $user->id)
                ->where('current_stage', ResearchStage::EXECUTION)
                ->count();
            
            $stats['my_projects_list'] = ResearchProject::where('project_lead_id', $user->id)
                ->with(['researchIdea', 'teamMembers'])
                ->get();
            
            $stats['my_tasks'] = \App\Models\ResearchTask::where('assigned_to', $user->id)
                ->where('status', '!=', 'completed')
                ->count();
            
            $stats['overdue_tasks'] = \App\Models\ResearchTask::where('assigned_to', $user->id)
                ->where('status', '!=', 'completed')
                ->where('due_date', '<', now())
                ->count();
        }
        
        // Review Committee: Screening and approval workload
        if ($user->hasRole('review_committee')) {
            $stats['pending_screenings'] = \App\Models\ResearchIdea::where('status', 'submitted')->count();
            $stats['pending_reviews'] = \App\Models\ProposalReview::where('decision', 'pending')->count();
            
            $stats['my_screenings'] = \App\Models\ResearchScreening::where('evaluated_by', $user->id)->count();
            $stats['my_approvals'] = \App\Models\ProposalReview::where('reviewer_id', $user->id)->count();
            
            $stats['ideas_to_screen'] = \App\Models\ResearchIdea::where('status', 'submitted')
                ->with('submitter')
                ->latest()
                ->take(10)
                ->get();
            
            $stats['projects_to_review'] = ResearchProject::where('current_stage', ResearchStage::APPROVAL)
                ->with('projectLead')
                ->get();
        }
        
        // Researcher: Own submissions and assignments
        if ($user->hasRole('researcher')) {
            $stats['my_ideas'] = \App\Models\ResearchIdea::where('submitted_by', $user->id)->count();
            $stats['my_approved_ideas'] = \App\Models\ResearchIdea::where('submitted_by', $user->id)
                ->where('status', 'approved')
                ->count();
            
            $stats['my_ideas_list'] = \App\Models\ResearchIdea::where('submitted_by', $user->id)
                ->latest()
                ->get();
            
            $stats['my_experiments'] = \App\Models\Experiment::where('conducted_by', $user->id)->count();
            
            $stats['my_tasks'] = \App\Models\ResearchTask::where('assigned_to', $user->id)
                ->where('status', '!=', 'completed')
                ->with('researchProject')
                ->get();
        }
        
        // Common: Team projects (for all authenticated users)
        $teamProjectIds = \App\Models\ResearchTeamMember::where('user_id', $user->id)
            ->where('is_active', true)
            ->pluck('research_project_id');
        
        if ($teamProjectIds->isNotEmpty()) {
            $stats['team_projects'] = ResearchProject::whereIn('id', $teamProjectIds)
                ->with('projectLead')
                ->get();
        }
        
        // TRL Distribution (for directors and committee)
        if ($user->hasAnyPermission(['view-research-analytics', 'assess-trl'])) {
            $stats['trl_distribution'] = ResearchProject::selectRaw('trl_level, count(*) as count')
                ->groupBy('trl_level')
                ->get()
                ->map(function($item) {
                    return [
                        'level' => $item->trl_level,
                        'label' => "TRL {$item->trl_level}",
                        'count' => $item->count
                    ];
                });
        }
        
        // System health metrics (directors only)
        if ($user->hasPermission('view-research-analytics')) {
            $stats['system_health'] = [
                'avg_screening_score' => \App\Models\ResearchScreening::avg('total_score'),
                'approval_rate' => $this->calculateApprovalRate(),
                'avg_completion_time' => $this->calculateAvgCompletionTime(),
                'active_researchers' => \App\Models\User::whereHas('roles', function($q) {
                    $q->whereIn('name', ['researcher', 'research_lead']);
                })->where('is_active', true)->count(),
            ];
        }

        return response()->json($stats);
    }
    
    public function myDashboard(Request $request)
    {
        $user = $request->user();
        
        $stats = [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->first()?->display_name ?? 'None',
            ],
            'my_ideas' => \App\Models\ResearchIdea::where('submitted_by', $user->id)->count(),
            'my_projects' => ResearchProject::where('project_lead_id', $user->id)->count(),
            'my_tasks' => \App\Models\ResearchTask::where('assigned_to', $user->id)
                ->where('status', '!=', 'completed')
                ->count(),
            'my_experiments' => \App\Models\Experiment::where('conducted_by', $user->id)->count(),
        ];
        
        // Recent activities
        $stats['recent_ideas'] = \App\Models\ResearchIdea::where('submitted_by', $user->id)
            ->with('screenings')
            ->latest()
            ->take(5)
            ->get();
        
        $stats['my_tasks_list'] = \App\Models\ResearchTask::where('assigned_to', $user->id)
            ->where('status', '!=', 'completed')
            ->with('researchProject')
            ->orderBy('due_date')
            ->take(10)
            ->get();
        
        $stats['team_projects'] = \App\Models\ResearchTeamMember::where('user_id', $user->id)
            ->where('is_active', true)
            ->with('researchProject.projectLead')
            ->get()
            ->pluck('researchProject');
        
        return response()->json($stats);
    }
    
    protected function calculateApprovalRate()
    {
        $total = \App\Models\ResearchScreening::count();
        if ($total === 0) return 0;
        
        $approved = \App\Models\ResearchScreening::where('decision', 'approved')->count();
        return round(($approved / $total) * 100, 2);
    }
    
    protected function calculateAvgCompletionTime()
    {
        $completed = ResearchProject::where('current_stage', ResearchStage::TECHNOLOGY_TRANSFER)
            ->whereNotNull('start_date')
            ->whereNotNull('end_date')
            ->get();
        
        if ($completed->isEmpty()) return null;
        
        $totalDays = 0;
        foreach ($completed as $project) {
            $totalDays += $project->start_date->diffInDays($project->end_date);
        }
        
        return round($totalDays / $completed->count(), 1);
    }
}
