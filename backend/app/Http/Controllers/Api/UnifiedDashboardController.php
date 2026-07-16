<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UnifiedDashboardController extends Controller
{
    /**
     * Get available dashboards for the authenticated user based on their permissions
     */
    public function getAvailableDashboards(Request $request)
    {
        $user = $request->user();
        $availableDashboards = [];

        // Define dashboard mappings: permission => dashboard info
        $dashboardMap = [
            'view_executive_dashboard' => [
                'name' => 'Executive Dashboard',
                'key' => 'executive',
                'route' => '/api/dashboards/executive',
                'description' => 'High-level system overview for administrators',
                'icon' => 'ChartBar',
                'order' => 1
            ],
            'view_auditor_dashboard' => [
                'name' => 'Auditor Dashboard',
                'key' => 'auditor',
                'route' => '/api/dashboards/auditor',
                'description' => 'Audits, feasibility studies, and evaluations',
                'icon' => 'ClipboardCheck',
                'order' => 2
            ],
            'view_institution_dashboard' => [
                'name' => 'Institution Dashboard',
                'key' => 'institution',
                'route' => '/api/dashboards/institution',
                'description' => 'Institution services and documents',
                'icon' => 'School',
                'order' => 3
            ],
            'view_research_dashboard' => [
                'name' => 'Research Dashboard',
                'key' => 'research',
                'route' => '/api/dashboards/research',
                'description' => 'Research projects and innovations',
                'icon' => 'Beaker',
                'order' => 4
            ],
            'view_licensing_dashboard' => [
                'name' => 'Professional Licensing',
                'key' => 'licensing',
                'route' => '/api/dashboards/licensing',
                'description' => 'License applications and compliance',
                'icon' => 'Award',
                'order' => 5
            ],
            'view_technology_transfer_dashboard' => [
                'name' => 'Technology Transfer',
                'key' => 'technology-transfer',
                'route' => '/api/dashboards/technology-transfer',
                'description' => 'Technology requests and governance',
                'icon' => 'Share',
                'order' => 6
            ],
            'view_dashboard' => [
                'name' => 'Main Dashboard',
                'key' => 'main',
                'route' => '/api/dashboard',
                'description' => 'General system dashboard',
                'icon' => 'Home',
                'order' => 0
            ],
        ];

        // Check each permission and add corresponding dashboard if user has it
        foreach ($dashboardMap as $permission => $dashboardInfo) {
            if ($user->hasPermission($permission)) {
                $availableDashboards[] = $dashboardInfo;
            }
        }

        // Sort by order
        usort($availableDashboards, function ($a, $b) {
            return $a['order'] <=> $b['order'];
        });

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                'institution' => $user->institution?->name,
            ],
            'dashboards' => $availableDashboards,
            'total_dashboards' => count($availableDashboards),
        ]);
    }

    /**
     * Get user's primary dashboard based on their highest priority role
     */
    public function getPrimaryDashboard(Request $request)
    {
        $user = $request->user();

        // Role priority order (highest to lowest)
        $rolePriority = [
            'itdb_administrator' => 'executive',
            'itdb_auditor' => 'auditor',
            'institutional_user' => 'institution',
            'research_director' => 'research',
            'research_lead' => 'research',
            'researcher' => 'research',
            'system_architect' => 'research',
            'review_committee' => 'research',
            'licensing_authority' => 'licensing',
            'verification_officer' => 'licensing',
            'exam_officer' => 'licensing',
            'disciplinary_committee' => 'licensing',
            'professional_applicant' => 'licensing',
            'public_user' => 'licensing',
            'technology_transfer_manager' => 'technology-transfer',
            'governance_committee' => 'technology-transfer',
            'security_officer' => 'technology-transfer',
            'enterprise_architect' => 'technology-transfer',
            'risk_officer' => 'technology-transfer',
            'compliance_officer' => 'technology-transfer',
            'legal_officer' => 'technology-transfer',
            'vendor' => 'technology-transfer',
        ];

        $primaryDashboard = 'main'; // Default fallback

        // Find the user's highest priority role
        foreach ($rolePriority as $role => $dashboard) {
            if ($user->hasRole($role)) {
                $primaryDashboard = $dashboard;
                break;
            }
        }

        return response()->json([
            'primary_dashboard' => $primaryDashboard,
            'route' => "/api/dashboards/{$primaryDashboard}",
        ]);
    }

    /**
     * Get dashboard permissions for current user
     */
    public function getPermissions(Request $request)
    {
        $user = $request->user();
        
        $dashboardPermissions = [
            'view_dashboard' => $user->hasPermission('view_dashboard'),
            'view_executive_dashboard' => $user->hasPermission('view_executive_dashboard'),
            'view_auditor_dashboard' => $user->hasPermission('view_auditor_dashboard'),
            'view_institution_dashboard' => $user->hasPermission('view_institution_dashboard'),
            'view_research_dashboard' => $user->hasPermission('view_research_dashboard'),
            'view_licensing_dashboard' => $user->hasPermission('view_licensing_dashboard'),
            'view_technology_transfer_dashboard' => $user->hasPermission('view_technology_transfer_dashboard'),
        ];

        return response()->json([
            'permissions' => $dashboardPermissions,
            'has_any_dashboard' => in_array(true, $dashboardPermissions, true),
        ]);
    }
}
