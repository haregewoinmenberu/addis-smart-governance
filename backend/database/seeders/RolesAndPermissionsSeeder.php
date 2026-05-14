<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define all permissions
        $permissions = [
            // User Management
            ['name' => 'view_users', 'display_name' => 'View Users', 'module' => 'users'],
            ['name' => 'create_users', 'display_name' => 'Create Users', 'module' => 'users'],
            ['name' => 'edit_users', 'display_name' => 'Edit Users', 'module' => 'users'],
            ['name' => 'delete_users', 'display_name' => 'Delete Users', 'module' => 'users'],
            ['name' => 'assign_roles', 'display_name' => 'Assign Roles', 'module' => 'users'],
            
            // Technology Requests
            ['name' => 'view_requests', 'display_name' => 'View Requests', 'module' => 'requests'],
            ['name' => 'create_requests', 'display_name' => 'Create Requests', 'module' => 'requests'],
            ['name' => 'edit_requests', 'display_name' => 'Edit Requests', 'module' => 'requests'],
            ['name' => 'delete_requests', 'display_name' => 'Delete Requests', 'module' => 'requests'],
            ['name' => 'approve_requests', 'display_name' => 'Approve Requests', 'module' => 'requests'],
            ['name' => 'reject_requests', 'display_name' => 'Reject Requests', 'module' => 'requests'],
            ['name' => 'view_all_requests', 'display_name' => 'View All Requests', 'module' => 'requests'],
            
            // Technology Registry
            ['name' => 'view_technologies', 'display_name' => 'View Technologies', 'module' => 'technologies'],
            ['name' => 'create_technologies', 'display_name' => 'Create Technologies', 'module' => 'technologies'],
            ['name' => 'edit_technologies', 'display_name' => 'Edit Technologies', 'module' => 'technologies'],
            ['name' => 'delete_technologies', 'display_name' => 'Delete Technologies', 'module' => 'technologies'],
            ['name' => 'view_all_technologies', 'display_name' => 'View All Technologies', 'module' => 'technologies'],
            
            // Audits
            ['name' => 'view_audits', 'display_name' => 'View Audits', 'module' => 'audits'],
            ['name' => 'create_audits', 'display_name' => 'Create Audits', 'module' => 'audits'],
            ['name' => 'conduct_audits', 'display_name' => 'Conduct Audits', 'module' => 'audits'],
            ['name' => 'view_audit_reports', 'display_name' => 'View Audit Reports', 'module' => 'audits'],
            ['name' => 'respond_to_audits', 'display_name' => 'Respond to Audits', 'module' => 'audits'],
            
            // Workflows
            ['name' => 'view_workflows', 'display_name' => 'View Workflows', 'module' => 'workflows'],
            ['name' => 'create_workflows', 'display_name' => 'Create Workflows', 'module' => 'workflows'],
            ['name' => 'edit_workflows', 'display_name' => 'Edit Workflows', 'module' => 'workflows'],
            ['name' => 'delete_workflows', 'display_name' => 'Delete Workflows', 'module' => 'workflows'],
            ['name' => 'configure_workflows', 'display_name' => 'Configure Workflows', 'module' => 'workflows'],
            
            // Vendors
            ['name' => 'view_vendors', 'display_name' => 'View Vendors', 'module' => 'vendors'],
            ['name' => 'create_vendors', 'display_name' => 'Create Vendors', 'module' => 'vendors'],
            ['name' => 'edit_vendors', 'display_name' => 'Edit Vendors', 'module' => 'vendors'],
            ['name' => 'approve_vendors', 'display_name' => 'Approve Vendors', 'module' => 'vendors'],
            
            // Reports
            ['name' => 'view_reports', 'display_name' => 'View Reports', 'module' => 'reports'],
            ['name' => 'create_reports', 'display_name' => 'Create Reports', 'module' => 'reports'],
            ['name' => 'export_reports', 'display_name' => 'Export Reports', 'module' => 'reports'],
            ['name' => 'view_all_reports', 'display_name' => 'View All Reports', 'module' => 'reports'],
            
            // Cybersecurity
            ['name' => 'view_cybersecurity', 'display_name' => 'View Cybersecurity', 'module' => 'cybersecurity'],
            ['name' => 'manage_cybersecurity', 'display_name' => 'Manage Cybersecurity', 'module' => 'cybersecurity'],
            ['name' => 'review_security_incidents', 'display_name' => 'Review Security Incidents', 'module' => 'cybersecurity'],
            
            // Settings
            ['name' => 'view_settings', 'display_name' => 'View Settings', 'module' => 'settings'],
            ['name' => 'manage_settings', 'display_name' => 'Manage Settings', 'module' => 'settings'],
            
            // Dashboard
            ['name' => 'view_dashboard', 'display_name' => 'View Dashboard', 'module' => 'dashboard'],
            ['name' => 'view_executive_dashboard', 'display_name' => 'View Executive Dashboard', 'module' => 'dashboard'],
            
            // Notifications
            ['name' => 'view_notifications', 'display_name' => 'View Notifications', 'module' => 'notifications'],
            ['name' => 'manage_notifications', 'display_name' => 'Manage Notifications', 'module' => 'notifications'],
            
            // Surveys
            ['name' => 'view_surveys', 'display_name' => 'View Surveys', 'module' => 'surveys'],
            ['name' => 'participate_surveys', 'display_name' => 'Participate in Surveys', 'module' => 'surveys'],
            ['name' => 'create_surveys', 'display_name' => 'Create Surveys', 'module' => 'surveys'],
            
            // Duplication Analysis
            ['name' => 'view_duplication', 'display_name' => 'View Duplication Analysis', 'module' => 'duplication'],
            ['name' => 'perform_duplication_analysis', 'display_name' => 'Perform Duplication Analysis', 'module' => 'duplication'],
            
            // Feasibility Studies
            ['name' => 'view_feasibility', 'display_name' => 'View Feasibility Studies', 'module' => 'feasibility'],
            ['name' => 'conduct_feasibility', 'display_name' => 'Conduct Feasibility Studies', 'module' => 'feasibility'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }

        // Define roles with their permissions
        $roles = [
            'itdb_administrator' => [
                'display_name' => 'ITDB Administrator',
                'description' => 'Main authority with full system oversight',
                'permissions' => Permission::all()->pluck('name')->toArray(), // All permissions
            ],
            'sub_city_administrator' => [
                'display_name' => 'Sub-City Administrator',
                'description' => 'Represents a sub-city government office',
                'permissions' => [
                    'view_dashboard',
                    'view_requests', 'create_requests', 'edit_requests',
                    'view_technologies', 'edit_technologies',
                    'view_reports',
                    'respond_to_audits',
                    'participate_surveys',
                    'view_notifications',
                    'view_duplication',
                    'view_feasibility',
                ],
            ],
            'auditor' => [
                'display_name' => 'Auditor',
                'description' => 'Independent regulatory and compliance role',
                'permissions' => [
                    'view_dashboard',
                    'view_requests', 'view_all_requests',
                    'view_technologies', 'view_all_technologies',
                    'view_audits', 'create_audits', 'conduct_audits', 'view_audit_reports',
                    'view_cybersecurity', 'review_security_incidents',
                    'view_reports', 'view_all_reports', 'export_reports',
                    'view_duplication', 'perform_duplication_analysis',
                    'view_feasibility', 'conduct_feasibility',
                    'view_notifications',
                ],
            ],
        ];

        foreach ($roles as $roleName => $roleData) {
            $role = Role::firstOrCreate(
                ['name' => $roleName],
                [
                    'display_name' => $roleData['display_name'],
                    'description' => $roleData['description'],
                ]
            );

            // Attach permissions to role
            $permissionIds = Permission::whereIn('name', $roleData['permissions'])->pluck('id');
            $role->permissions()->sync($permissionIds);
        }

        $this->command->info('Roles and permissions seeded successfully!');
    }
}
