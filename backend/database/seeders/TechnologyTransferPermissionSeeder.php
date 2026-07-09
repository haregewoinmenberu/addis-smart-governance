<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Facades\DB;

class TechnologyTransferPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['name' => 'submit-technology-request', 'display_name' => 'Submit Technology Request', 'module' => 'technology_transfer'],
            ['name' => 'view-technology-requests', 'display_name' => 'View Technology Requests', 'module' => 'technology_transfer'],
            ['name' => 'edit-technology-requests', 'display_name' => 'Edit Technology Requests', 'module' => 'technology_transfer'],
            ['name' => 'delete-technology-requests', 'display_name' => 'Delete Technology Requests', 'module' => 'technology_transfer'],
            ['name' => 'evaluate-technology', 'display_name' => 'Evaluate Technology', 'module' => 'technology_transfer'],
            ['name' => 'view-evaluations', 'display_name' => 'View Evaluations', 'module' => 'technology_transfer'],
            ['name' => 'approve-technology', 'display_name' => 'Approve Technology', 'module' => 'technology_transfer'],
            ['name' => 'reject-technology', 'display_name' => 'Reject Technology', 'module' => 'technology_transfer'],
            ['name' => 'manage-technology-registry', 'display_name' => 'Manage Technology Registry', 'module' => 'technology_transfer'],
            ['name' => 'view-technology-registry', 'display_name' => 'View Technology Registry', 'module' => 'technology_transfer'],
            ['name' => 'create-deployment-project', 'display_name' => 'Create Deployment Project', 'module' => 'technology_transfer'],
            ['name' => 'manage-deployments', 'display_name' => 'Manage Deployments', 'module' => 'technology_transfer'],
            ['name' => 'view-monitoring', 'display_name' => 'View Monitoring', 'module' => 'technology_transfer'],
            ['name' => 'manage-monitoring', 'display_name' => 'Manage Monitoring', 'module' => 'technology_transfer'],
            ['name' => 'create-incident', 'display_name' => 'Create Incident', 'module' => 'technology_transfer'],
            ['name' => 'manage-incidents', 'display_name' => 'Manage Incidents', 'module' => 'technology_transfer'],
            ['name' => 'revoke-technology', 'display_name' => 'Revoke Technology', 'module' => 'technology_transfer'],
            ['name' => 'view-audit-logs', 'display_name' => 'View Audit Logs', 'module' => 'technology_transfer'],
            ['name' => 'generate-tech-reports', 'display_name' => 'Generate Technology Reports', 'module' => 'technology_transfer'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }

        $roles = [
            'technology_transfer_manager' => [
                'name' => 'Technology Transfer Manager',
                'permissions' => [
                    'view-technology-requests', 'edit-technology-requests', 'manage-technology-registry',
                    'manage-deployments', 'view-monitoring', 'manage-incidents', 'generate-tech-reports'
                ]
            ],
            'governance_committee' => [
                'name' => 'Governance Committee',
                'permissions' => [
                    'view-technology-requests', 'view-evaluations', 'approve-technology', 'reject-technology', 'revoke-technology'
                ]
            ],
            'security_officer' => [
                'name' => 'Security Officer',
                'permissions' => [
                    'evaluate-technology', 'view-evaluations', 'view-monitoring', 'create-incident', 'manage-incidents'
                ]
            ],
            'enterprise_architect' => [
                'name' => 'Enterprise Architect',
                'permissions' => [
                    'evaluate-technology', 'view-evaluations', 'view-technology-registry'
                ]
            ],
            'risk_officer' => [
                'name' => 'Risk Officer',
                'permissions' => [
                    'evaluate-technology', 'view-evaluations', 'view-monitoring'
                ]
            ],
            'compliance_officer' => [
                'name' => 'Compliance Officer',
                'permissions' => [
                    'evaluate-technology', 'view-evaluations', 'view-monitoring', 'view-audit-logs'
                ]
            ],
            'legal_officer' => [
                'name' => 'Legal Officer',
                'permissions' => [
                    'evaluate-technology', 'view-evaluations', 'view-technology-requests'
                ]
            ],
            'vendor' => [
                'name' => 'Vendor',
                'permissions' => [
                    'submit-technology-request', 'view-technology-requests'
                ]
            ],
        ];

        foreach ($roles as $roleKey => $roleData) {
            $role = Role::firstOrCreate(
                ['name' => $roleKey],
                ['display_name' => $roleData['name']]
            );

            $permissionIds = Permission::whereIn('name', $roleData['permissions'])->pluck('id');
            
            foreach ($permissionIds as $permissionId) {
                DB::table('permission_role')->updateOrInsert(
                    ['role_id' => $role->id, 'permission_id' => $permissionId],
                    ['role_id' => $role->id, 'permission_id' => $permissionId]
                );
            }
        }

        $this->command->info('Technology Transfer permissions and roles created successfully!');
    }
}
