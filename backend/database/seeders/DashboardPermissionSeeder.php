<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;

/**
 * Additive, idempotent seeder that introduces the per-role dashboard
 * view permissions and attaches them to the appropriate roles WITHOUT
 * detaching any existing permissions. Safe to run on live databases:
 *
 *   php artisan db:seed --class=DashboardPermissionSeeder
 */
class DashboardPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create the dashboard permissions (idempotent)
        $permissions = [
            'view_executive_dashboard'           => 'View Executive Dashboard',
            'view_subcity_dashboard'             => 'View Sub-City Dashboard',
            'view_auditor_dashboard'             => 'View Auditor Dashboard',
            'view_institution_dashboard'         => 'View Institution Dashboard',
            'view_research_dashboard'            => 'View Research Dashboard',
            'view_licensing_dashboard'           => 'View Licensing Dashboard',
            'view_technology_transfer_dashboard' => 'View Technology Transfer Dashboard',
        ];

        foreach ($permissions as $name => $displayName) {
            Permission::firstOrCreate(
                ['name' => $name],
                [
                    'display_name' => $displayName,
                    'module' => 'dashboard',
                    'description' => $displayName,
                ]
            );
        }

        // 2. Attach permissions to roles (without detaching existing ones).
        //    Covers all 24 roles across the 7 dashboard domains.
        //    Note: ALL roles get view_dashboard (main dashboard) permission
        $roleMap = [
            // Core governance
            'itdb_administrator' => ['view_dashboard', 'view_executive_dashboard'],
            'itdb_auditor'       => ['view_dashboard', 'view_auditor_dashboard'],

            // Institution
            'institutional_user' => ['view_dashboard', 'view_institution_dashboard'],

            // Research
            'research_director'  => ['view_dashboard', 'view_research_dashboard'],
            'research_lead'      => ['view_dashboard', 'view_research_dashboard'],
            'system_architect'   => ['view_dashboard', 'view_research_dashboard'],
            'review_committee'   => ['view_dashboard', 'view_research_dashboard'],
            'researcher'         => ['view_dashboard', 'view_research_dashboard'],

            // Professional Licensing
            'licensing_authority'    => ['view_dashboard', 'view_licensing_dashboard'],
            'verification_officer'   => ['view_dashboard', 'view_licensing_dashboard'],
            'exam_officer'           => ['view_dashboard', 'view_licensing_dashboard'],
            'disciplinary_committee' => ['view_dashboard', 'view_licensing_dashboard'],
            'professional_applicant' => ['view_dashboard', 'view_licensing_dashboard'],
            'public_user'            => ['view_dashboard', 'view_licensing_dashboard'],

            // Technology Transfer
            'technology_transfer_manager' => ['view_dashboard', 'view_technology_transfer_dashboard'],
            'governance_committee'        => ['view_dashboard', 'view_technology_transfer_dashboard'],
            'security_officer'            => ['view_dashboard', 'view_technology_transfer_dashboard'],
            'enterprise_architect'        => ['view_dashboard', 'view_technology_transfer_dashboard'],
            'risk_officer'                => ['view_dashboard', 'view_technology_transfer_dashboard'],
            'compliance_officer'          => ['view_dashboard', 'view_technology_transfer_dashboard'],
            'legal_officer'               => ['view_dashboard', 'view_technology_transfer_dashboard'],
            'vendor'                      => ['view_dashboard', 'view_technology_transfer_dashboard'],
        ];

        foreach ($roleMap as $roleName => $permNames) {
            $role = Role::where('name', $roleName)->first();
            if (!$role) {
                continue;
            }

            $ids = Permission::whereIn('name', $permNames)->pluck('id')->all();
            $role->permissions()->syncWithoutDetaching($ids);
        }

        $this->command->info('✓ Dashboard permissions seeded and attached to roles.');
    }
}
