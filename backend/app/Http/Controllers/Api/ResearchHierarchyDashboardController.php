<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchProject;
use App\Models\ResearchIdea;
use App\Models\ResearchTask;
use App\Models\SmartCityResearchRequest;
use App\Models\ResearchCommunication;
use App\Enums\ResearchStage;
use App\Enums\IdeaStatus;
use Illuminate\Http\Request;

class ResearchHierarchyDashboardController extends Controller
{
    /**
     * Unified Research Dashboard with role-based content
     * Dashboard: /dashboard/research
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $userRole = $user->roles->first()?->name ?? 'none';

        $dashboard = [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $userRole,
            ],
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ];

        // Role-based dashboard content
        switch ($userRole) {
            case 'smart_city_command':
                $dashboard = array_merge($dashboard, $this->getSmartCityCommandDashboard($user));
                break;

            case 'research_director':
                $dashboard = array_merge($dashboard, $this->getResearchDirectorDashboard($user));
                break;

            case 'research_lead':
                $dashboard = array_merge($dashboard, $this->getResearchLeadDashboard($user));
                break;

            case 'review_committee':
                $dashboard = array_merge($dashboard, $this->getReviewCommitteeDashboard($user));
                break;

            case 'researcher':
                $dashboard = array_merge($dashboard, $this->getResearcherDashboard($user));
                break;

            default:
                $dashboard['message'] = 'No research dashboard access';
        }

        return response()->json($dashboard);
    }

    /**
     * Smart City Command Center Dashboard
     */
    private function getSmartCityCommandDashboard($user): array
    {
        return [
            'title' => 'Smart City Command Center - Research Integration',
            'stats' => [
                'total_requests' => SmartCityResearchRequest::where('requested_by', $user->id)->count(),
                'pending_requests' => SmartCityResearchRequest::where('requested_by', $user->id)->where('status', 'pending')->count(),
                'in_progress' => SmartCityResearchRequest::where('requested_by', $user->id)->where('status', 'in_progress')->count(),
                'completed_requests' => SmartCityResearchRequest::where('requested_by', $user->id)->where('status', 'completed')->count(),
                'delivered_research' => SmartCityResearchRequest::where('requested_by', $user->id)->where('status', 'delivered')->count(),
            ],
            'recent_requests' => SmartCityResearchRequest::where('requested_by', $user->id)
                ->with(['assignedTo', 'researchProject'])
                ->latest()
                ->limit(10)
                ->get(),
            'unread_communications' => ResearchCommunication::forUser($user->id)
                ->unread()
                ->count(),
            'communications' => ResearchCommunication::forUser($user->id)
                ->with(['fromUser', 'researchProject'])
                ->latest()
                ->limit(5)
                ->get(),
            'sectors_overview' => SmartCityResearchRequest::where('requested_by', $user->id)
                ->selectRaw('requesting_sector, count(*) as count, status')
                ->groupBy('requesting_sector', 'status')
                ->get()
                ->groupBy('requesting_sector'),
        ];
    }

    /**
     * Research Director Dashboard
     */
    private function getResearchDirectorDashboard($user): array
    {
        return [
            'title' => 'Research Director Dashboard - Dr. Sarah Johnson',
            'stats' => [
                'total_projects' => ResearchProject::count(),
                'active_projects' => ResearchProject::whereIn('current_stage', [
                    ResearchStage::PROPOSAL_DEVELOPMENT,
                    ResearchStage::EXECUTION
                ])->count(),
                'total_ideas' => ResearchIdea::count(),
                'pending_approvals' => ResearchProject::where('approved_by_director', false)
                    ->where('current_stage', ResearchStage::APPROVAL)
                    ->count(),
                'smart_city_requests' => SmartCityResearchRequest::where('status', 'pending')
                    ->orWhere('assigned_to', $user->id)
                    ->count(),
                'pending_screenings' => ResearchIdea::where('status', IdeaStatus::SUBMITTED)->count(),
            ],
            'smart_city_requests' => SmartCityResearchRequest::where('assigned_to', $user->id)
                ->orWhere('status', 'pending')
                ->with(['requestedBy', 'researchProject'])
                ->latest()
                ->limit(10)
                ->get(),
            'projects_for_approval' => ResearchProject::where('approved_by_director', false)
                ->where('current_stage', ResearchStage::APPROVAL)
                ->with(['projectLead', 'researchIdea'])
                ->latest()
                ->limit(10)
                ->get(),
            'projects_by_stage' => collect(ResearchStage::cases())->map(fn ($stage) => [
                'stage' => $stage->value,
                'label' => $stage->label(),
                'count' => ResearchProject::where('current_stage', $stage)->count(),
            ]),
            'recent_projects' => ResearchProject::with(['projectLead', 'researchDirector'])
                ->latest()
                ->limit(10)
                ->get(),
            'unread_communications' => ResearchCommunication::forUser($user->id)
                ->unread()
                ->count(),
            'communications' => ResearchCommunication::forUser($user->id)
                ->with(['fromUser', 'researchProject'])
                ->latest()
                ->limit(10)
                ->get(),
        ];
    }

    /**
     * Research Lead Dashboard
     */
    private function getResearchLeadDashboard($user): array
    {
        return [
            'title' => 'Research Lead Dashboard - Prof. Michael Chen',
            'stats' => [
                'my_projects' => ResearchProject::where('project_lead_id', $user->id)->count(),
                'active_projects' => ResearchProject::where('project_lead_id', $user->id)
                    ->where('current_stage', ResearchStage::EXECUTION)
                    ->count(),
                'total_tasks' => ResearchTask::whereHas('project', function ($q) use ($user) {
                    $q->where('project_lead_id', $user->id);
                })->count(),
                'pending_tasks' => ResearchTask::whereHas('project', function ($q) use ($user) {
                    $q->where('project_lead_id', $user->id);
                })->where('status', 'pending')->count(),
                'team_members' => \App\Models\ResearchTeamMember::whereHas('project', function ($q) use ($user) {
                    $q->where('project_lead_id', $user->id);
                })->distinct('user_id')->count(),
            ],
            'my_projects' => ResearchProject::where('project_lead_id', $user->id)
                ->with(['researchDirector', 'teamMembers.user'])
                ->latest()
                ->limit(10)
                ->get(),
            'projects_by_stage' => ResearchProject::where('project_lead_id', $user->id)
                ->selectRaw('current_stage, count(*) as count')
                ->groupBy('current_stage')
                ->get()
                ->map(function ($item) {
                    return [
                        'stage' => $item->current_stage,
                        'label' => $item->current_stage->label(),
                        'count' => $item->count
                    ];
                }),
            'team_tasks' => ResearchTask::whereHas('project', function ($q) use ($user) {
                $q->where('project_lead_id', $user->id);
            })->with(['assignedUser', 'project'])
                ->latest()
                ->limit(15)
                ->get(),
            'unread_communications' => ResearchCommunication::forUser($user->id)
                ->unread()
                ->count(),
        ];
    }

    /**
     * Review Committee Dashboard
     */
    private function getReviewCommitteeDashboard($user): array
    {
        return [
            'title' => 'Review Committee Dashboard - Dr. Emily Brown',
            'stats' => [
                'pending_screenings' => ResearchIdea::where('status', IdeaStatus::SUBMITTED)->count(),
                'pending_proposal_reviews' => \App\Models\ProposalReview::whereNull('reviewed_at')->count(),
                'pending_evaluations' => \App\Models\ResearchEvaluation::whereNull('evaluated_by')->count(),
                'total_reviewed' => \App\Models\ResearchScreening::where('evaluated_by', $user->id)->count(),
            ],
            'pending_screenings' => ResearchIdea::where('status', IdeaStatus::SUBMITTED)
                ->with(['submitter', 'subCity'])
                ->latest()
                ->limit(10)
                ->get(),
            'pending_proposals' => \App\Models\ProposalVersion::where('is_current', true)
                ->whereHas('project', function ($q) {
                    $q->where('current_stage', ResearchStage::APPROVAL);
                })
                ->with(['project.projectLead'])
                ->latest()
                ->limit(10)
                ->get(),
            'pending_evaluations' => \App\Models\ResearchEvaluation::whereNull('evaluated_by')
                ->with(['project'])
                ->latest()
                ->limit(10)
                ->get(),
            'my_reviews' => \App\Models\ResearchScreening::where('evaluated_by', $user->id)
                ->with(['researchIdea'])
                ->latest()
                ->limit(10)
                ->get(),
        ];
    }

    /**
     * Researcher Dashboard
     */
    private function getResearcherDashboard($user): array
    {
        return [
            'title' => 'Researcher Dashboard - David Martinez',
            'stats' => [
                'my_tasks' => ResearchTask::where('assigned_to', $user->id)->count(),
                'pending_tasks' => ResearchTask::where('assigned_to', $user->id)
                    ->where('status', 'pending')
                    ->count(),
                'completed_tasks' => ResearchTask::where('assigned_to', $user->id)
                    ->where('status', 'completed')
                    ->count(),
                'my_projects' => \App\Models\ResearchTeamMember::where('user_id', $user->id)
                    ->distinct('research_project_id')
                    ->count(),
                'my_experiments' => \App\Models\Experiment::where('conducted_by', $user->id)->count(),
            ],
            'my_tasks' => ResearchTask::where('assigned_to', $user->id)
                ->with(['project.projectLead', 'milestone'])
                ->latest()
                ->limit(15)
                ->get(),
            'my_projects' => ResearchProject::whereHas('teamMembers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
                ->with(['projectLead', 'researchDirector'])
                ->latest()
                ->limit(10)
                ->get(),
            'my_experiments' => \App\Models\Experiment::where('conducted_by', $user->id)
                ->with(['project'])
                ->latest()
                ->limit(10)
                ->get(),
            'unread_communications' => ResearchCommunication::forUser($user->id)
                ->unread()
                ->count(),
        ];
    }

    /**
     * Get workflow visualization data
     */
    public function workflow(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'workflow_stages' => collect(ResearchStage::cases())->map(function ($stage) {
                return [
                    'value' => $stage->value,
                    'label' => $stage->label(),
                    'count' => ResearchProject::where('current_stage', $stage)->count(),
                ];
            }),
            'hierarchy' => [
                ['role' => 'smart_city_command', 'label' => 'Smart City Command Center', 'level' => 1],
                ['role' => 'research_director', 'label' => 'Research Director', 'level' => 2],
                ['role' => 'research_lead', 'label' => 'Research Lead', 'level' => 3],
                ['role' => 'review_committee', 'label' => 'Review Committee', 'level' => 3],
                ['role' => 'researcher', 'label' => 'Researcher', 'level' => 4],
            ],
        ]);
    }
}
