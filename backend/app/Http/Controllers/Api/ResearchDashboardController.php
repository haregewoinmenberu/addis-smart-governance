<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Enums\IdeaStatus;
use App\Enums\ResearchStage;
use App\Models\ResearchIdea;
use App\Models\ResearchProject;
use App\Models\ResearchScreening;
use App\Models\ResearchEvaluation;
use App\Models\ResearchTask;
use Illuminate\Http\Request;

class ResearchDashboardController extends Controller
{
    /**
     * Research & Innovation Dashboard
     * For research_director, research_lead, researcher, system_architect, review_committee
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $stats = [
            'user_role' => $user->roles->first()?->name ?? 'none',

            // Ideas
            'total_ideas' => ResearchIdea::count(),
            'ideas_pending_screening' => ResearchIdea::where('status', IdeaStatus::SUBMITTED)->count(),
            'ideas_approved' => ResearchIdea::where('status', IdeaStatus::APPROVED)->count(),
            'ideas_by_status' => collect(IdeaStatus::cases())->map(fn ($s) => [
                'status' => $s->value,
                'label' => ucfirst(str_replace('_', ' ', $s->value)),
                'count' => ResearchIdea::where('status', $s)->count(),
            ])->values(),

            // Projects
            'total_projects' => ResearchProject::count(),
            'active_projects' => ResearchProject::whereIn('current_stage', [
                ResearchStage::PROPOSAL_DEVELOPMENT,
                ResearchStage::EXECUTION,
            ])->count(),
            'completed_projects' => ResearchProject::where('current_stage', ResearchStage::TECHNOLOGY_TRANSFER)->count(),
            'projects_by_stage' => collect(ResearchStage::cases())->map(fn ($s) => [
                'stage' => $s->value,
                'label' => ucfirst(str_replace('_', ' ', $s->value)),
                'count' => ResearchProject::where('current_stage', $s)->count(),
            ])->values(),

            // Tasks & Progress
            'total_tasks' => ResearchTask::count(),
            'pending_tasks' => ResearchTask::where('status', 'pending')->count(),
            'completed_tasks' => ResearchTask::where('status', 'completed')->count(),

            // Evaluations
            'pending_evaluations' => ResearchEvaluation::whereNull('evaluated_by')->count(),

            // Screenings
            'pending_screenings' => ResearchScreening::where('decision', null)->count(),

            // Budget Overview
            'total_budget_allocated' => ResearchProject::sum('estimated_budget'),
            'budget_spent' => 0, // actual_budget column doesn't exist

            // Recent activity
            'recent_projects' => ResearchProject::with(['projectLead'])
                ->latest()->take(5)->get(),
            'recent_ideas' => ResearchIdea::with('submitter')
                ->latest()->take(5)->get(),
        ];

        // Role-specific data
        if ($user->hasRole('researcher')) {
            $stats['my_projects'] = ResearchProject::whereHas('teamMembers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->count();
            $stats['my_tasks'] = ResearchTask::where('assigned_to', $user->id)
                ->where('status', '!=', 'completed')->count();
        }

        if ($user->hasRole('research_lead')) {
            $stats['projects_i_lead'] = ResearchProject::where('project_lead_id', $user->id)->count();
            $stats['team_tasks_pending'] = ResearchTask::whereHas('project', function ($q) use ($user) {
                $q->where('project_lead_id', $user->id);
            })->where('status', 'pending')->count();
        }

        if ($user->hasRole('research_director')) {
            // Director-specific stats can be added when we have the proper column
            $stats['ideas_for_review'] = ResearchIdea::where('status', IdeaStatus::SUBMITTED)->count();
        }

        if ($user->hasRole('review_committee')) {
            $stats['screenings_pending'] = ResearchScreening::where('decision', null)->count();
            $stats['evaluations_pending'] = ResearchEvaluation::whereNull('evaluated_by')
                ->whereHas('project', function ($q) {
                    $q->whereIn('current_stage', [ResearchStage::PROPOSAL_DEVELOPMENT, ResearchStage::EXECUTION]);
                })->count();
        }

        return response()->json($stats);
    }
}
