<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RequestItem;
use App\Models\Technology;
use App\Models\Vendor;
use App\Models\CybersecurityIssue;
use App\Models\DuplicationCase;
use App\Models\WorkflowInstance;
use Illuminate\Http\Request;

class TechnologyTransferDashboardController extends Controller
{
    /**
     * Technology Transfer Dashboard
     * For technology_transfer_manager, governance_committee, security_officer,
     * enterprise_architect, risk_officer, compliance_officer, legal_officer, vendor
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $stats = [
            'user_role' => $user->roles->first()?->name ?? 'none',

            // Technology Requests
            'total_requests' => RequestItem::count(),
            'pending_requests' => RequestItem::where('status', 'Pending')->count(),
            'in_review_requests' => RequestItem::where('status', 'In review')->count(),
            'approved_requests' => RequestItem::where('status', 'Approved')->count(),
            'rejected_requests' => RequestItem::where('status', 'Rejected')->count(),
            'requests_by_status' => RequestItem::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get(),

            // Technologies
            'total_registered' => Technology::count(),
            'active_technologies' => Technology::where('status', 'Active')->count(),
            'inactive_technologies' => Technology::where('status', 'Inactive')->count(),

            // Workflows
            'active_workflows' => WorkflowInstance::whereIn('status', ['in_progress', 'pending'])->count(),
            'completed_workflows' => WorkflowInstance::where('status', 'completed')->count(),
            'workflows_by_status' => WorkflowInstance::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get(),

            // Duplication & Compliance
            'duplicate_systems' => DuplicationCase::count(),
            'high_similarity_duplicates' => DuplicationCase::where('similarity_score', '>', 70)->count(),

            // Cybersecurity
            'high_risk_issues' => CybersecurityIssue::where('severity', 'High')->count(),
            'medium_risk_issues' => CybersecurityIssue::where('severity', 'Medium')->count(),
            'total_security_issues' => CybersecurityIssue::count(),
            'open_security_issues' => CybersecurityIssue::whereIn('status', ['Open', 'In Progress'])->count(),

            // Vendors
            'total_vendors' => Vendor::count(),
            'approved_vendors' => Vendor::where('status', 'approved')->count(),
            'average_vendor_score' => round(Vendor::avg('score') ?? 0, 1),

            // Recent Activity
            'recent_requests' => RequestItem::with(['submittedBy'])
                ->latest()->take(10)->get(),
            'recent_approvals' => WorkflowInstance::where('status', 'completed')
                ->latest()->take(5)->get(),
            'recent_duplicates' => DuplicationCase::latest()->take(5)->get(),
        ];

        // Role-specific data
        if ($user->hasRole('security_officer')) {
            $stats['security_focus'] = [
                'critical_issues' => CybersecurityIssue::where('severity', 'High')
                    ->where('status', '!=', 'Resolved')->count(),
                'vulnerabilities_detected' => CybersecurityIssue::where('type', 'Vulnerability')->count(),
                'incidents_reported' => CybersecurityIssue::where('type', 'Incident')->count(),
            ];
        }

        if ($user->hasRole('vendor')) {
            $vendor = Vendor::where('user_id', $user->id)->first();
            if ($vendor) {
                $stats['vendor_info'] = [
                    'vendor_name' => $vendor->name,
                    'vendor_score' => $vendor->score,
                    'approval_status' => $vendor->status ?? 'pending',
                    'active_projects' => $vendor->active_projects ?? 0,
                ];
            }
        }

        if ($user->hasRole('compliance_officer')) {
            $stats['compliance_focus'] = [
                'compliance_rate' => 92, // Calculate based on audit results
                'total_systems' => Technology::count(),
                'pending_audits' => 0, // Based on audit schedule
            ];
        }

        if ($user->hasRole('governance_committee')) {
            $stats['governance_focus'] = [
                'pending_approvals' => WorkflowInstance::where('status', 'pending')
                    ->whereHas('currentStage', function ($q) {
                        $q->where('required_role', 'governance_committee');
                    })->count(),
                'policies_under_review' => 0, // Placeholder
            ];
        }

        return response()->json($stats);
    }
}
