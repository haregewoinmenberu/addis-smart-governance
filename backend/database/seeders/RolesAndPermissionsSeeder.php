<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Permissions
        $permissions = $this->createPermissions();

        // Create Roles
        $roles = $this->createRoles();

        // Assign Permissions to Roles
        $this->assignPermissions($roles, $permissions);

        $this->command->info('Roles and permissions seeded successfully!');
    }

    /**
     * Create all permissions.
     */
    protected function createPermissions(): array
    {
        $permissionGroups = [
            // Dashboard
            'dashboard' => [
                ['name' => 'view_dashboard', 'display_name' => 'View Dashboard'],
            ],

            // Sub-Cities Management
            'sub_cities' => [
                ['name' => 'view_sub_cities', 'display_name' => 'View Sub-Cities'],
                ['name' => 'create_sub_cities', 'display_name' => 'Create Sub-Cities'],
                ['name' => 'edit_sub_cities', 'display_name' => 'Edit Sub-Cities'],
                ['name' => 'delete_sub_cities', 'display_name' => 'Delete Sub-Cities'],
                ['name' => 'manage_sub_city_admins', 'display_name' => 'Manage Sub-City Administrators'],
            ],

            // User Management
            'users' => [
                ['name' => 'view_users', 'display_name' => 'View Users'],
                ['name' => 'create_users', 'display_name' => 'Create Users'],
                ['name' => 'edit_users', 'display_name' => 'Edit Users'],
                ['name' => 'delete_users', 'display_name' => 'Delete Users'],
                ['name' => 'manage_roles', 'display_name' => 'Manage User Roles'],
                ['name' => 'view_all_users', 'display_name' => 'View All Users (System-wide)'],
                ['name' => 'create_itdb_users', 'display_name' => 'Create ITDB Users'],
                ['name' => 'create_subcity_users', 'display_name' => 'Create Sub-City Users'],
            ],

            // Technology Requests
            'requests' => [
                ['name' => 'view_requests', 'display_name' => 'View Requests'],
                ['name' => 'create_requests', 'display_name' => 'Create Requests'],
                ['name' => 'edit_requests', 'display_name' => 'Edit Requests'],
                ['name' => 'delete_requests', 'display_name' => 'Delete Requests'],
                ['name' => 'submit_requests', 'display_name' => 'Submit Requests'],
                ['name' => 'view_all_requests', 'display_name' => 'View All Requests (System-wide)'],
            ],

            // Workflow Management
            'workflows' => [
                ['name' => 'view_workflows', 'display_name' => 'View Workflows'],
                ['name' => 'create_workflows', 'display_name' => 'Create Workflow Definitions'],
                ['name' => 'edit_workflows', 'display_name' => 'Edit Workflow Definitions'],
                ['name' => 'delete_workflows', 'display_name' => 'Delete Workflow Definitions'],
                ['name' => 'approve_workflows', 'display_name' => 'Approve Workflow Stages'],
                ['name' => 'final_approval', 'display_name' => 'Final Approval Authority'],
                ['name' => 'override_workflows', 'display_name' => 'Override Workflow Decisions'],
                ['name' => 'cancel_workflows', 'display_name' => 'Cancel Workflows'],
            ],

            // Duplication Analysis
            'duplication' => [
                ['name' => 'view_duplication', 'display_name' => 'View Duplication Analysis'],
                ['name' => 'perform_duplication_analysis', 'display_name' => 'Perform Duplication Analysis'],
                ['name' => 'override_duplication_analysis', 'display_name' => 'Override Duplication Analysis'],
            ],

            // Feasibility Studies
            'feasibility' => [
                ['name' => 'view_feasibility', 'display_name' => 'View Feasibility Studies'],
                ['name' => 'conduct_feasibility', 'display_name' => 'Conduct Feasibility Studies'],
                ['name' => 'approve_feasibility', 'display_name' => 'Approve Feasibility Studies'],
            ],

            // Technology Registry
            'technologies' => [
                ['name' => 'view_technologies', 'display_name' => 'View Technologies'],
                ['name' => 'create_technologies', 'display_name' => 'Register Technologies'],
                ['name' => 'edit_technologies', 'display_name' => 'Edit Technologies'],
                ['name' => 'delete_technologies', 'display_name' => 'Delete Technologies'],
                ['name' => 'view_all_technologies', 'display_name' => 'View All Technologies (System-wide)'],
            ],

            // Audits
            'audits' => [
                ['name' => 'view_audits', 'display_name' => 'View Audits'],
                ['name' => 'create_audits', 'display_name' => 'Create Audits'],
                ['name' => 'conduct_audits', 'display_name' => 'Conduct Audits'],
                ['name' => 'approve_audits', 'display_name' => 'Approve Audit Reports'],
                ['name' => 'view_all_audits', 'display_name' => 'View All Audits (System-wide)'],
            ],

            // Vendors
            'vendors' => [
                ['name' => 'view_vendors', 'display_name' => 'View Vendors'],
                ['name' => 'create_vendors', 'display_name' => 'Create Vendors'],
                ['name' => 'edit_vendors', 'display_name' => 'Edit Vendors'],
                ['name' => 'approve_vendors', 'display_name' => 'Approve Vendors'],
            ],

            // Surveys
            'surveys' => [
                ['name' => 'view_surveys', 'display_name' => 'View Surveys'],
                ['name' => 'create_surveys', 'display_name' => 'Create Surveys'],
                ['name' => 'manage_surveys', 'display_name' => 'Manage Surveys'],
                ['name' => 'participate_surveys', 'display_name' => 'Participate in Surveys'],
                ['name' => 'collect_survey_data', 'display_name' => 'Collect Survey Data'],
            ],

            // Reports
            'reports' => [
                ['name' => 'view_reports', 'display_name' => 'View Reports'],
                ['name' => 'create_reports', 'display_name' => 'Create Reports'],
                ['name' => 'export_reports', 'display_name' => 'Export Reports'],
                ['name' => 'view_system_reports', 'display_name' => 'View System-wide Reports'],
            ],

            // Cybersecurity
            'cybersecurity' => [
                ['name' => 'view_cybersecurity', 'display_name' => 'View Cybersecurity Issues'],
                ['name' => 'manage_cybersecurity', 'display_name' => 'Manage Cybersecurity Issues'],
                ['name' => 'resolve_cybersecurity', 'display_name' => 'Resolve Cybersecurity Issues'],
            ],

            // Notifications
            'notifications' => [
                ['name' => 'view_notifications', 'display_name' => 'View Notifications'],
                ['name' => 'send_notifications', 'display_name' => 'Send Notifications'],
            ],

            // System Settings
            'settings' => [
                ['name' => 'view_settings', 'display_name' => 'View System Settings'],
                ['name' => 'manage_settings', 'display_name' => 'Manage System Settings'],
            ],

            // Data Collection
            'data_collection' => [
                ['name' => 'encode_data', 'display_name' => 'Encode System Data'],
                ['name' => 'collect_field_data', 'display_name' => 'Collect Field Data'],
                ['name' => 'gather_feedback', 'display_name' => 'Gather Citizen Feedback'],
            ],
        ];

        $permissions = [];
        foreach ($permissionGroups as $module => $perms) {
            foreach ($perms as $perm) {
                $permissions[$perm['name']] = Permission::firstOrCreate(
                    ['name' => $perm['name']],
                    [
                        'display_name' => $perm['display_name'],
                        'module' => $module,
                        'description' => $perm['display_name'],
                    ]
                );
            }
        }

        return $permissions;
    }

    /**
     * Create all roles.
     */
    protected function createRoles(): array
    {
        return [
            'itdb_administrator' => Role::firstOrCreate(
                ['name' => 'itdb_administrator'],
                [
                    'display_name' => 'ITDB Administrator',
                    'description' => 'Top authority with full system access. Creates sub-cities, assigns auditors, makes final approvals, and oversees all operations.',
                ]
            ),

            'itdb_auditor' => Role::firstOrCreate(
                ['name' => 'itdb_auditor'],
                [
                    'display_name' => 'ITDB Auditor',
                    'description' => 'Performs feasibility studies, conducts technical analysis, reviews requests, and provides recommendations.',
                ]
            ),

            'sub_city_admin' => Role::firstOrCreate(
                ['name' => 'sub_city_admin'],
                [
                    'display_name' => 'Sub-City Administrator',
                    'description' => 'Manages assigned sub-city, submits technology requests, oversees operations, and manages sub-city auditors.',
                ]
            ),

            'sub_city_auditor' => Role::firstOrCreate(
                ['name' => 'sub_city_auditor'],
                [
                    'display_name' => 'Sub-City Auditor',
                    'description' => 'Collects surveys and field data, encodes system usage, gathers citizen feedback, and supports feasibility studies.',
                ]
            ),
        ];
    }

    /**
     * Assign permissions to roles based on hierarchy.
     */
    protected function assignPermissions(array $roles, array $permissions): void
    {
        // 1. ITDB Administrator - Full System Access
        $itdbAdminPermissions = [
            // Dashboard
            'view_dashboard',
            
            // Sub-Cities (Full Control)
            'view_sub_cities', 'create_sub_cities', 'edit_sub_cities', 'delete_sub_cities', 'manage_sub_city_admins',
            
            // Users (Full Control)
            'view_users', 'create_users', 'edit_users', 'delete_users', 'manage_roles', 
            'view_all_users', 'create_itdb_users', 'create_subcity_users',
            
            // Requests (Full Control)
            'view_requests', 'create_requests', 'edit_requests', 'delete_requests', 
            'submit_requests', 'view_all_requests',
            
            // Workflows (Full Control)
            'view_workflows', 'create_workflows', 'edit_workflows', 'delete_workflows',
            'approve_workflows', 'final_approval', 'override_workflows', 'cancel_workflows',
            
            // Duplication Analysis (Full Control)
            'view_duplication', 'perform_duplication_analysis', 'override_duplication_analysis',
            
            // Feasibility (Full Control)
            'view_feasibility', 'conduct_feasibility', 'approve_feasibility',
            
            // Technologies (Full Control)
            'view_technologies', 'create_technologies', 'edit_technologies', 
            'delete_technologies', 'view_all_technologies',
            
            // Audits (Full Control)
            'view_audits', 'create_audits', 'conduct_audits', 'approve_audits', 'view_all_audits',
            
            // Vendors (Full Control)
            'view_vendors', 'create_vendors', 'edit_vendors', 'approve_vendors',
            
            // Surveys (Full Control)
            'view_surveys', 'create_surveys', 'manage_surveys', 'participate_surveys', 'collect_survey_data',
            
            // Reports (Full Control)
            'view_reports', 'create_reports', 'export_reports', 'view_system_reports',
            
            // Cybersecurity (Full Control)
            'view_cybersecurity', 'manage_cybersecurity', 'resolve_cybersecurity',
            
            // Notifications
            'view_notifications', 'send_notifications',
            
            // Settings (Full Control)
            'view_settings', 'manage_settings',
            
            // Data Collection
            'encode_data', 'collect_field_data', 'gather_feedback',
        ];

        // 2. ITDB Auditor - Evaluation & Analysis Focus
        $itdbAuditorPermissions = [
            // Dashboard
            'view_dashboard',
            
            // Requests (View All, No Create)
            'view_requests', 'view_all_requests',
            
            // Workflows (Approve at evaluation stages)
            'view_workflows', 'approve_workflows',
            
            // Duplication Analysis (Full Control)
            'view_duplication', 'perform_duplication_analysis', 'override_duplication_analysis',
            
            // Feasibility (Full Control)
            'view_feasibility', 'conduct_feasibility', 'approve_feasibility',
            
            // Technologies (View All)
            'view_technologies', 'view_all_technologies',
            
            // Audits (Conduct)
            'view_audits', 'create_audits', 'conduct_audits', 'view_all_audits',
            
            // Vendors (View & Evaluate)
            'view_vendors', 'approve_vendors',
            
            // Surveys (View)
            'view_surveys',
            
            // Reports (View & Create)
            'view_reports', 'create_reports', 'export_reports', 'view_system_reports',
            
            // Cybersecurity (View & Manage)
            'view_cybersecurity', 'manage_cybersecurity', 'resolve_cybersecurity',
            
            // Notifications
            'view_notifications',
            
            // Settings (View Only)
            'view_settings',
        ];

        // 3. Sub-City Administrator - Sub-City Management
        $subCityAdminPermissions = [
            // Dashboard
            'view_dashboard',
            
            // Sub-Cities (View Own Only)
            'view_sub_cities',
            
            // Users (Sub-City Scope)
            'view_users', 'create_subcity_users', 'edit_users',
            
            // Requests (Sub-City Scope)
            'view_requests', 'create_requests', 'edit_requests', 'delete_requests', 'submit_requests',
            
            // Workflows (View & Track)
            'view_workflows',
            
            // Duplication (View Only)
            'view_duplication',
            
            // Feasibility (View Only)
            'view_feasibility',
            
            // Technologies (Sub-City Scope)
            'view_technologies', 'create_technologies', 'edit_technologies',
            
            // Audits (View Sub-City)
            'view_audits',
            
            // Vendors (View & Create)
            'view_vendors', 'create_vendors',
            
            // Surveys (Manage)
            'view_surveys', 'create_surveys', 'manage_surveys', 'participate_surveys',
            
            // Reports (Sub-City Scope)
            'view_reports', 'create_reports', 'export_reports',
            
            // Cybersecurity (View & Report)
            'view_cybersecurity', 'manage_cybersecurity',
            
            // Notifications
            'view_notifications',
            
            // Settings (View Only)
            'view_settings',
        ];

        // 4. Sub-City Auditor - Data Collection Focus
        $subCityAuditorPermissions = [
            // Dashboard
            'view_dashboard',
            
            // Requests (View Only - Sub-City)
            'view_requests',
            
            // Workflows (View Only)
            'view_workflows',
            
            // Technologies (View & Update)
            'view_technologies', 'edit_technologies',
            
            // Audits (Support)
            'view_audits',
            
            // Surveys (Full Control - Sub-City)
            'view_surveys', 'create_surveys', 'manage_surveys', 'participate_surveys', 'collect_survey_data',
            
            // Reports (View & Create Basic)
            'view_reports', 'create_reports',
            
            // Notifications
            'view_notifications',
            
            // Data Collection (Full Control)
            'encode_data', 'collect_field_data', 'gather_feedback',
        ];

        // Assign permissions to roles
        $this->assignPermissionsToRole($roles['itdb_administrator'], $permissions, $itdbAdminPermissions);
        $this->assignPermissionsToRole($roles['itdb_auditor'], $permissions, $itdbAuditorPermissions);
        $this->assignPermissionsToRole($roles['sub_city_admin'], $permissions, $subCityAdminPermissions);
        $this->assignPermissionsToRole($roles['sub_city_auditor'], $permissions, $subCityAuditorPermissions);
        
        $this->command->newLine();
        $this->command->info('✓ All permissions assigned to roles successfully!');
    }

    /**
     * Helper to assign permissions to a role.
     */
    protected function assignPermissionsToRole(Role $role, array $allPermissions, array $permissionNames): void
    {
        $permissionIds = [];
        foreach ($permissionNames as $permName) {
            if (isset($allPermissions[$permName])) {
                $permissionIds[] = $allPermissions[$permName]->id;
            }
        }

        $role->permissions()->sync($permissionIds);
        $this->command->info("Assigned " . count($permissionIds) . " permissions to {$role->display_name}");
    }
}
