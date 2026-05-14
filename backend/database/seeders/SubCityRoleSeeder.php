<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class SubCityRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Sub-City Admin role
        $subCityAdminRole = Role::firstOrCreate(
            ['name' => 'sub_city_admin'],
            [
                'display_name' => 'Sub-City Administrator',
                'description' => 'Administrator for a specific sub-city organization with full access to their sub-city data',
            ]
        );

        // Define permissions for sub-city admin
        $subCityPermissions = [
            // Dashboard
            'view_dashboard',
            
            // Users (within their sub-city)
            'view_users',
            'create_users',
            'edit_users',
            'delete_users',
            
            // Technology Requests
            'view_requests',
            'create_requests',
            'edit_requests',
            'delete_requests',
            
            // Technologies
            'view_technologies',
            'create_technologies',
            'edit_technologies',
            
            // Surveys
            'view_surveys',
            'create_surveys',
            'participate_surveys',
            
            // Reports
            'view_reports',
            'create_reports',
            
            // Workflows
            'view_workflows',
            
            // Vendors
            'view_vendors',
            
            // Audits (view only)
            'view_audits',
            
            // Cybersecurity
            'view_cybersecurity',
            'manage_cybersecurity',
            
            // Duplication
            'view_duplication',
            
            // Feasibility
            'view_feasibility',
            
            // Notifications
            'view_notifications',
            
            // Settings (view only)
            'view_settings',
        ];

        // Attach permissions to sub-city admin role
        foreach ($subCityPermissions as $permissionName) {
            $permission = Permission::where('name', $permissionName)->first();
            if ($permission && !$subCityAdminRole->permissions->contains($permission->id)) {
                $subCityAdminRole->permissions()->attach($permission->id);
            }
        }

        // Create permissions for sub-city management (ITDB Admin only)
        $subCityManagementPermissions = [
            [
                'name' => 'view_sub_cities',
                'display_name' => 'View Sub-Cities',
                'description' => 'View sub-city organizations',
                'module' => 'sub_cities',
            ],
            [
                'name' => 'create_sub_cities',
                'display_name' => 'Create Sub-Cities',
                'description' => 'Register new sub-city organizations',
                'module' => 'sub_cities',
            ],
            [
                'name' => 'edit_sub_cities',
                'display_name' => 'Edit Sub-Cities',
                'description' => 'Edit sub-city organization details',
                'module' => 'sub_cities',
            ],
            [
                'name' => 'delete_sub_cities',
                'display_name' => 'Delete Sub-Cities',
                'description' => 'Delete sub-city organizations',
                'module' => 'sub_cities',
            ],
        ];

        foreach ($subCityManagementPermissions as $permData) {
            Permission::firstOrCreate(
                ['name' => $permData['name']],
                $permData
            );
        }

        // Assign sub-city management permissions to ITDB Administrator
        $itdbAdminRole = Role::where('name', 'itdb_administrator')->first();
        if ($itdbAdminRole) {
            foreach ($subCityManagementPermissions as $permData) {
                $permission = Permission::where('name', $permData['name'])->first();
                if ($permission && !$itdbAdminRole->permissions->contains($permission->id)) {
                    $itdbAdminRole->permissions()->attach($permission->id);
                }
            }
        }

        $this->command->info('Sub-City roles and permissions created successfully!');
    }
}
