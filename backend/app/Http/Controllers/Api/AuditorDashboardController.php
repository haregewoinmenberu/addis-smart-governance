<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Audit;
use App\Models\RequestItem;
use App\Models\FeasibilityStudy;
use App\Models\DuplicationCase;
use App\Models\CybersecurityIssue;
use App\Models\Technology;
use App\Models\WorkflowInstance;
use Illuminate\Http\Request;

class AuditorDashboardController extends Controller
{
    /**
     * Auditor Dashboard
     * For itdb_auditor role
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $stats = [
            'user_role' => $user->roles->first()?->name ?? 'none',
            'scope' => $isSubCityAuditor ? 'Sub-City' : 'System-wide',
            'sub_city_name' => $subCity?->name ?? 'N/A',

            // Audits
            'total_audits' => $this->getAuditsQuery($subCity)->count(),
            'in_progress_audits' => $this->getAuditsQuery($subCity)
                ->where('status', 'In Progress')->count(),
            'completed_audits' => $this->getAuditsQuery($subCity)
                ->where('status', 'Completed')->count(),
            'audits_by_status' => $this->getAuditsQuery($subCity)
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get(),

            // Feasibility Studies
            'total_feasibility_studies' => $this->getFeasibilityQuery($subCity)->count(),
            'pending_feasibility' => $this->getFeasibilityQuery($subCity)
                ->where('status', 'pending')->count(),
            'completed_feasibility' => $this->getFeasibilityQuery($subCity)
                ->where('status', 'completed')->count(),

            // Duplication Analysis
            'total_duplication_cases' => $this->getDuplicationQuery($subCity)->count(),
            'high_similarity_cases' => $this->getDuplicationQuery($subCity)
                ->where('similarity_score', '>', 70)->count(),

            // Cybersecurity Issues
            'total_security_issues' => $this->getCybersecurityQuery($subCity)->count(),
            'high_severity_issues' => $this->getCybersecurityQuery($subCity)
                ->where('severity', 'High')->count(),
            'open_security_issues' => $this->getCybersecurityQuery($subCity)
                ->whereIn('status', ['Open', 'In Progress'])->count(),

            // Technology Requests to Review
            'requests_pending_review' => $this->getRequestsQuery($subCity)
                ->where('status', 'In review')->count(),

            // Workflow Approvals Pending
            'workflows_pending_approval' => $this->getWorkflowsQuery($subCity)
                ->where('status', 'pending')->count(),

            // Technologies to Evaluate
            'total_technologies' => $this->getTechnologiesQuery($subCity)->count(),

            // Recent Activity
            'recent_audits' => $this->getAuditsQuery($subCity)
                ->with('technology')
                ->latest()->take(10)->get(),
            'recent_feasibility_studies' => $this->getFeasibilityQuery($subCity)
                ->with('request')
                ->latest()->take(5)->get(),
            'recent_security_issues' => $this->getCybersecurityQuery($subCity)
                ->latest()->take(5)->get(),
        ];

        // Role-specific metrics
        if ($isSubCityAuditor) {
            $stats['data_collection_tasks'] = [
                'surveys_to_collect' => 0, // Placeholder - implement based on survey model
                'field_data_entries' => 0, // Placeholder
                'feedback_collected' => 0, // Placeholder
            ];
        }

        return response()->json($stats);
    }

    /**
     * Scope queries based on sub-city for sub-city auditors
     */
    private function getAuditsQuery($subCity)
    {
        $query = Audit::query();
        if ($subCity) {
            $query->whereHas('technology', function ($q) use ($subCity) {
                $q->where('sub_city_id', $subCity->id);
            });
        }
        return $query;
    }

    private function getFeasibilityQuery($subCity)
    {
        $query = FeasibilityStudy::query();
        if ($subCity) {
            $query->whereHas('request', function ($q) use ($subCity) {
                $q->where('sub_city_id', $subCity->id);
            });
        }
        return $query;
    }

    private function getDuplicationQuery($subCity)
    {
        $query = DuplicationCase::query();
        if ($subCity) {
            $query->whereHas('request', function ($q) use ($subCity) {
                $q->where('sub_city_id', $subCity->id);
            });
        }
        return $query;
    }

    private function getCybersecurityQuery($subCity)
    {
        $query = CybersecurityIssue::query();
        if ($subCity) {
            $query->where('sub_city_id', $subCity->id);
        }
        return $query;
    }

    private function getRequestsQuery($subCity)
    {
        $query = RequestItem::query();
        if ($subCity) {
            $query->where('sub_city_id', $subCity->id);
        }
        return $query;
    }

    private function getWorkflowsQuery($subCity)
    {
        $query = WorkflowInstance::query();
        if ($subCity) {
            $query->whereHas('request', function ($q) use ($subCity) {
                $q->where('sub_city_id', $subCity->id);
            });
        }
        return $query;
    }

    private function getTechnologiesQuery($subCity)
    {
        $query = Technology::query();
        if ($subCity) {
            $query->where('sub_city_id', $subCity->id);
        }
        return $query;
    }
}
