<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\SubCity;
use App\Models\RequestItem;
use App\Models\Technology;
use App\Models\WorkflowInstance;
use App\Models\Audit;
use App\Models\CybersecurityIssue;
use App\Models\DuplicationCase;
use App\Models\ResearchProject;
use App\Models\License;
use App\Models\Institution;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExecutiveDashboardController extends Controller
{
    /**
     * Executive Dashboard
     * For itdb_administrator - high-level system overview
     */
    public function index(Request $request)
    {
        $stats = [
            'user_role' => $request->user()->roles->first()?->name ?? 'none',

            // System Overview
            'total_users' => User::count(),
            'active_users' => User::where('is_active', true)->count(),
            'total_sub_cities' => SubCity::count(),
            'active_sub_cities' => SubCity::where('is_active', true)->count(),

            // Technology Management
            'total_technologies' => Technology::count(),
            'pending_requests' => RequestItem::where('status', 'Pending')->count(),
            'active_workflows' => WorkflowInstance::whereIn('status', ['in_progress', 'pending'])->count(),
            'duplicate_systems_detected' => DuplicationCase::where('similarity_score', '>', 70)->count(),

            // Governance & Compliance
            'total_audits' => Audit::count(),
            'pending_audits' => Audit::where('status', 'In Progress')->count(),
            'compliance_rate' => $this->calculateComplianceRate(),

            // Cybersecurity
            'high_severity_issues' => CybersecurityIssue::where('severity', 'High')->count(),
            'medium_severity_issues' => CybersecurityIssue::where('severity', 'Medium')->count(),
            'total_security_issues' => CybersecurityIssue::count(),

            // Research & Innovation
            'total_research_projects' => ResearchProject::count(),
            'active_research_projects' => ResearchProject::whereIn('stage', ['design', 'development', 'testing'])->count(),

            // Professional Licensing
            'total_licenses_issued' => License::count(),
            'active_licenses' => License::where('status', 'active')->count(),

            // Institutions
            'total_institutions' => Institution::count(),
            'verified_institutions' => Institution::where('verification_status', 'verified')->count(),

            // Activity Trends (Last 30 days)
            'requests_this_month' => RequestItem::whereDate('created_at', '>=', now()->subDays(30))->count(),
            'workflows_completed_this_month' => WorkflowInstance::where('status', 'completed')
                ->whereDate('updated_at', '>=', now()->subDays(30))->count(),

            // Sub-City Performance
            'sub_city_stats' => SubCity::withCount([
                'requests',
                'technologies',
                'users'
            ])->get()->map(function ($subCity) {
                return [
                    'name' => $subCity->name,
                    'requests' => $subCity->requests_count ?? 0,
                    'technologies' => $subCity->technologies_count ?? 0,
                    'users' => $subCity->users_count ?? 0,
                ];
            }),

            // Recent Critical Activities
            'recent_high_priority_requests' => RequestItem::where('priority', 'High')
                ->latest()->take(5)->get(),
            'recent_audits' => Audit::latest()->take(5)->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Calculate overall system compliance rate
     */
    private function calculateComplianceRate(): float
    {
        $totalAudits = Audit::count();
        if ($totalAudits === 0) {
            return 0;
        }

        $passedAudits = Audit::where('compliance_score', '>=', 75)->count();
        return round(($passedAudits / $totalAudits) * 100, 1);
    }
}
