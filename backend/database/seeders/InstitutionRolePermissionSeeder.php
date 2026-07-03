<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class InstitutionRolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Institution Permissions
        $institutionPermissions = [
            [
                'name' => 'view_institutions',
                'display_name' => 'View Institutions',
                'module' => 'institutions',
                'description' => 'View institution details and listings'
            ],
            [
                'name' => 'edit_institutions',
                'display_name' => 'Edit Institutions',
                'module' => 'institutions',
                'description' => 'Update institution information'
            ],
            [
                'name' => 'verify_institutions',
                'display_name' => 'Verify Institutions',
                'module' => 'institutions',
                'description' => 'Verify and approve institution registrations'
            ],
        ];

        foreach ($institutionPermissions as $permissionData) {
            Permission::updateOrCreate(
                ['name' => $permissionData['name']],
                $permissionData
            );
        }

        // Create Institutional User Role
        $institutionalUserRole = Role::updateOrCreate(
            ['name' => 'institutional_user'],
            [
                'display_name' => 'Institutional User',
                'description' => 'Users from registered institutions who can submit requests'
            ]
        );

        // Assign permissions to institutional_user role
        $institutionalUserPermissions = [
            'view_dashboard',
            'view_requests',
            'create_requests',
            'edit_requests',
            'submit_requests',
            'view_technologies',
            'view_notifications',
            'view_reports',
        ];

        foreach ($institutionalUserPermissions as $permissionName) {
            $permission = Permission::where('name', $permissionName)->first();
            if ($permission && !$institutionalUserRole->permissions()->where('permission_id', $permission->id)->exists()) {
                $institutionalUserRole->permissions()->attach($permission->id);
            }
        }

        // Add institution permissions to ITDB Administrator
        $itdbAdminRole = Role::where('name', 'itdb_administrator')->first();
        if ($itdbAdminRole) {
            foreach ($institutionPermissions as $permissionData) {
                $permission = Permission::where('name', $permissionData['name'])->first();
                if ($permission && !$itdbAdminRole->permissions()->where('permission_id', $permission->id)->exists()) {
                    $itdbAdminRole->permissions()->attach($permission->id);
                }
            }
        }

        $this->command->info('Institution roles and permissions created successfully!');
    }
}
