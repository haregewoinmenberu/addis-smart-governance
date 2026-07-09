<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Role;
use App\Models\Permission;

class ResearchPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Research Ideas
            ['name' => 'view-research-ideas', 'display_name' => 'View Research Ideas', 'module' => 'research'],
            ['name' => 'create-research-ideas', 'display_name' => 'Create Research Ideas', 'module' => 'research'],
            ['name' => 'edit-research-ideas', 'display_name' => 'Edit Research Ideas', 'module' => 'research'],
            ['name' => 'delete-research-ideas', 'display_name' => 'Delete Research Ideas', 'module' => 'research'],
            ['name' => 'submit-research-ideas', 'display_name' => 'Submit Research Ideas', 'module' => 'research'],
            
            // Research Screening
            ['name' => 'view-research-screenings', 'display_name' => 'View Research Screenings', 'module' => 'research'],
            ['name' => 'create-research-screenings', 'display_name' => 'Create Research Screenings', 'module' => 'research'],
            ['name' => 'edit-research-screenings', 'display_name' => 'Edit Research Screenings', 'module' => 'research'],
            ['name' => 'approve-research-screenings', 'display_name' => 'Approve Research Screenings', 'module' => 'research'],
            
            // Research Projects
            ['name' => 'view-research-projects', 'display_name' => 'View Research Projects', 'module' => 'research'],
            ['name' => 'create-research-projects', 'display_name' => 'Create Research Projects', 'module' => 'research'],
            ['name' => 'edit-research-projects', 'display_name' => 'Edit Research Projects', 'module' => 'research'],
            ['name' => 'delete-research-projects', 'display_name' => 'Delete Research Projects', 'module' => 'research'],
            ['name' => 'manage-research-projects', 'display_name' => 'Manage Research Projects', 'module' => 'research'],
            
            // Workflow
            ['name' => 'transition-research-stages', 'display_name' => 'Transition Research Stages', 'module' => 'research'],
            ['name' => 'rollback-research-stages', 'display_name' => 'Rollback Research Stages', 'module' => 'research'],
            
            // Proposals
            ['name' => 'view-proposals', 'display_name' => 'View Proposals', 'module' => 'research'],
            ['name' => 'create-proposals', 'display_name' => 'Create Proposals', 'module' => 'research'],
            ['name' => 'edit-proposals', 'display_name' => 'Edit Proposals', 'module' => 'research'],
            ['name' => 'review-proposals', 'display_name' => 'Review Proposals', 'module' => 'research'],
            ['name' => 'approve-proposals', 'display_name' => 'Approve Proposals', 'module' => 'research'],
            
            // Execution
            ['name' => 'manage-milestones', 'display_name' => 'Manage Milestones', 'module' => 'research'],
            ['name' => 'manage-tasks', 'display_name' => 'Manage Tasks', 'module' => 'research'],
            ['name' => 'manage-experiments', 'display_name' => 'Manage Experiments', 'module' => 'research'],
            ['name' => 'manage-prototypes', 'display_name' => 'Manage Prototypes', 'module' => 'research'],
            ['name' => 'submit-progress-reports', 'display_name' => 'Submit Progress Reports', 'module' => 'research'],
            
            // Evaluation
            ['name' => 'evaluate-research', 'display_name' => 'Evaluate Research', 'module' => 'research'],
            ['name' => 'assess-trl', 'display_name' => 'Assess TRL', 'module' => 'research'],
            
            // Technology Transfer
            ['name' => 'manage-technology-transfer', 'display_name' => 'Manage Technology Transfer', 'module' => 'research'],
            ['name' => 'approve-technology-transfer', 'display_name' => 'Approve Technology Transfer', 'module' => 'research'],
            
            // Reports & Analytics
            ['name' => 'view-research-reports', 'display_name' => 'View Research Reports', 'module' => 'research'],
            ['name' => 'view-research-analytics', 'display_name' => 'View Research Analytics', 'module' => 'research'],
        ];

        $permissionIds = [];
        foreach ($permissions as $permission) {
            $perm = Permission::firstOrCreate(
                ['name' => $permission['name']],
                $permission
            );
            $permissionIds[$permission['name']] = $perm->id;
        }

        // Research Director Role
        $researchDirector = Role::firstOrCreate(
            ['name' => 'research_director'],
            ['display_name' => 'Research Director', 'description' => 'Full access to research management system']
        );
        $researchDirector->permissions()->sync($permissionIds);

        // Research Lead Role
        $researchLead = Role::firstOrCreate(
            ['name' => 'research_lead'],
            ['display_name' => 'Research Lead', 'description' => 'Lead research projects and teams']
        );
        $leadPermissions = [
            'view-research-ideas', 'create-research-ideas', 'edit-research-ideas', 'submit-research-ideas',
            'view-research-projects', 'create-research-projects', 'edit-research-projects', 'manage-research-projects',
            'view-proposals', 'create-proposals', 'edit-proposals',
            'manage-milestones', 'manage-tasks', 'manage-experiments', 'manage-prototypes', 'submit-progress-reports',
            'view-research-reports',
        ];
        $researchLead->permissions()->sync(array_intersect_key($permissionIds, array_flip($leadPermissions)));

        // System Architect Role
        $architect = Role::firstOrCreate(
            ['name' => 'system_architect'],
            ['display_name' => 'System Architect', 'description' => 'Design and architect research systems']
        );
        $architectPermissions = [
            'view-research-projects', 'manage-research-projects',
            'manage-milestones', 'manage-tasks', 'manage-experiments', 'manage-prototypes',
        ];
        $architect->permissions()->sync(array_intersect_key($permissionIds, array_flip($architectPermissions)));

        // Review Committee Role
        $committee = Role::firstOrCreate(
            ['name' => 'review_committee'],
            ['display_name' => 'Review Committee', 'description' => 'Review and approve research proposals']
        );
        $committeePermissions = [
            'view-research-ideas', 'view-research-screenings', 'create-research-screenings', 'approve-research-screenings',
            'view-proposals', 'review-proposals', 'approve-proposals',
            'evaluate-research', 'assess-trl', 'approve-technology-transfer',
        ];
        $committee->permissions()->sync(array_intersect_key($permissionIds, array_flip($committeePermissions)));

        // Researcher Role
        $researcher = Role::firstOrCreate(
            ['name' => 'researcher'],
            ['display_name' => 'Researcher', 'description' => 'Conduct research and experiments']
        );
        $researcherPermissions = [
            'view-research-ideas', 'create-research-ideas',
            'view-research-projects', 'manage-tasks', 'manage-experiments',
        ];
        $researcher->permissions()->sync(array_intersect_key($permissionIds, array_flip($researcherPermissions)));
    }
}
