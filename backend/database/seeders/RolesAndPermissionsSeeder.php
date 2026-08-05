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
                ['name' => 'view_executive_dashboard', 'display_name' => 'View Executive Dashboard'],
                ['name' => 'view_reports_dashboard', 'display_name' => 'View Reports Dashboard'],
            ],


            // User Management
            'users' => [
                ['name' => 'view_users', 'display_name' => 'View Users'],
                ['name' => 'create_users', 'display_name' => 'Create Users'],
                ['name' => 'edit_users', 'display_name' => 'Edit Users'],
                ['name' => 'delete_users', 'display_name' => 'Delete Users'],
                ['name' => 'manage_roles', 'display_name' => 'Manage Roles and Permissions'],
            ],


            // Request Management
            'requests' => [
                ['name' => 'view_requests', 'display_name' => 'View Requests'],
                ['name' => 'receive_requests', 'display_name' => 'Receive Requests'],
                ['name' => 'assign_requests', 'display_name' => 'Assign Requests'],
                ['name' => 'reassign_requests', 'display_name' => 'Reassign Requests'],
                ['name' => 'approve_requests', 'display_name' => 'Approve Requests'],
                ['name' => 'reject_requests', 'display_name' => 'Reject Requests'],
                ['name' => 'return_requests', 'display_name' => 'Return Requests For Revision'],
                ['name' => 'change_request_priority', 'display_name' => 'Change Request Priority'],
                ['name' => 'close_requests', 'display_name' => 'Close Requests'],
            ],


            // Training Management
            'training' => [
                ['name' => 'view_training', 'display_name' => 'View Training'],
                ['name' => 'create_training', 'display_name' => 'Create Training'],
                ['name' => 'edit_training', 'display_name' => 'Edit Training'],
                ['name' => 'assign_training_officer', 'display_name' => 'Assign Training Officer'],
                ['name' => 'schedule_training', 'display_name' => 'Schedule Training'],
                ['name' => 'approve_training', 'display_name' => 'Approve Training'],
                ['name' => 'cancel_training', 'display_name' => 'Cancel Training'],
                ['name' => 'upload_training_material', 'display_name' => 'Upload Training Material'],
                ['name' => 'upload_attendance', 'display_name' => 'Upload Attendance'],
                ['name' => 'generate_certificate', 'display_name' => 'Generate Certificate'],
                ['name' => 'complete_training', 'display_name' => 'Complete Training'],
            ],


            // Research / Technology Evaluation
            'research' => [
                ['name' => 'view_research', 'display_name' => 'View Research / Evaluation'],
                ['name' => 'create_research_ideas', 'display_name' => 'Create Research / Technology Requests'],
                ['name' => 'edit_research_ideas', 'display_name' => 'Edit Research / Technology Requests'],
                ['name' => 'delete_research_ideas', 'display_name' => 'Delete Research / Technology Requests'],
                ['name' => 'submit_research_ideas', 'display_name' => 'Submit Research / Technology Requests'],
                ['name' => 'assign_research', 'display_name' => 'Assign Research / Evaluation'],
                ['name' => 'conduct_research', 'display_name' => 'Conduct Technical Assessment'],
                ['name' => 'technology_assessment', 'display_name' => 'Technology Assessment'],
                ['name' => 'cost_benefit_analysis', 'display_name' => 'Cost Benefit Analysis'],
                ['name' => 'risk_analysis', 'display_name' => 'Risk Analysis'],
                ['name' => 'submit_feasibility', 'display_name' => 'Submit Feasibility Study'],
                ['name' => 'approve_research', 'display_name' => 'Approve Research / Evaluation'],
                ['name' => 'approve_feasibility', 'display_name' => 'Approve Feasibility Study'],
                ['name' => 'forward_project', 'display_name' => 'Forward Project'],
                ['name' => 'assign_team_leader', 'display_name' => 'Assign Evaluation Team Leader'],
                ['name' => 'assign_officer', 'display_name' => 'Assign Technical Evaluation Officer'],
                ['name' => 'manage_research_workflow', 'display_name' => 'Manage Evaluation Process'],
                ['name' => 'manage_workflow_stages', 'display_name' => 'Manage Evaluation Workflow Stages'],
                ['name' => 'view_assigned_research', 'display_name' => 'View Assigned Evaluation'],
                ['name' => 'update_research_progress', 'display_name' => 'Update Evaluation Progress'],
                ['name' => 'submit_research_stage', 'display_name' => 'Submit Evaluation Stage'],
                ['name' => 'review_research_stage', 'display_name' => 'Review Evaluation Stage'],
                ['name' => 'approve_research_stage', 'display_name' => 'Approve Evaluation Stage'],
                ['name' => 'forward_to_smart_city', 'display_name' => 'Forward Evaluation to Smart City'],
                ['name' => 'view_research_reports', 'display_name' => 'View Evaluation Reports'],
                ['name' => 'generate_research_reports', 'display_name' => 'Generate Evaluation Reports'],
                // Specific Evaluation Permissions
                ['name' => 'view_evaluations', 'display_name' => 'View Technology Evaluations'],
                ['name' => 'review_evaluation', 'display_name' => 'Review Technology Evaluation'],
                ['name' => 'approve_evaluation', 'display_name' => 'Approve Technology Evaluation'],
                ['name' => 'reject_evaluation', 'display_name' => 'Reject Technology Evaluation'],
                ['name' => 'issue_clearance', 'display_name' => 'Issue Technology Clearance Certificate'],
                ['name' => 'view_assigned_evaluation', 'display_name' => 'View Assigned Evaluation'],
                ['name' => 'update_evaluation', 'display_name' => 'Update Evaluation'],
                ['name' => 'review_assessment', 'display_name' => 'Review Technical Assessment'],
                ['name' => 'submit_report', 'display_name' => 'Submit Evaluation Report'],
                ['name' => 'view_assigned_task', 'display_name' => 'View Assigned Technical Task'],
                ['name' => 'update_assessment', 'display_name' => 'Update Technical Assessment'],
                ['name' => 'upload_documents', 'display_name' => 'Upload Evaluation Documents'],
                ['name' => 'submit_assessment', 'display_name' => 'Submit Technical Assessment'],
            ],


            // Security Management
            'security' => [
                ['name' => 'view_security_review', 'display_name' => 'View Security Review'],
                ['name' => 'assign_security_review', 'display_name' => 'Assign Security Review'],
                ['name' => 'security_assessment', 'display_name' => 'Security Assessment'],
                ['name' => 'vulnerability_assessment', 'display_name' => 'Vulnerability Assessment'],
                ['name' => 'penetration_testing', 'display_name' => 'Penetration Testing'],
                ['name' => 'approve_security', 'display_name' => 'Approve Security Review'],
                ['name' => 'reject_security', 'display_name' => 'Reject Security Review'],
                ['name' => 'issue_security_clearance', 'display_name' => 'Issue Security Clearance'],
            ],


            // Project Management
            'projects' => [
                ['name' => 'view_projects', 'display_name' => 'View Projects'],
                ['name' => 'create_project', 'display_name' => 'Create Project'],
                ['name' => 'edit_project', 'display_name' => 'Edit Project'],
                ['name' => 'assign_project', 'display_name' => 'Assign Project'],
                ['name' => 'assign_project_manager', 'display_name' => 'Assign Project Manager'],
                ['name' => 'update_project_timeline', 'display_name' => 'Update Project Timeline'],
                ['name' => 'approve_milestone', 'display_name' => 'Approve Milestone'],
                ['name' => 'approve_deliverable', 'display_name' => 'Approve Deliverable'],
                ['name' => 'close_project', 'display_name' => 'Close Project'],
                ['name' => 'archive_project', 'display_name' => 'Archive Project'],
            ],


            // Task Management
            'tasks' => [
                ['name' => 'create_tasks', 'display_name' => 'Create Tasks'],
                ['name' => 'assign_tasks', 'display_name' => 'Assign Tasks'],
                ['name' => 'update_task_status', 'display_name' => 'Update Task Status'],
                ['name' => 'submit_task', 'display_name' => 'Submit Task'],
                ['name' => 'review_task', 'display_name' => 'Review Task'],
            ],


            // Software Development
            'software' => [
                ['name' => 'assign_developer', 'display_name' => 'Assign Developer'],
                ['name' => 'review_architecture', 'display_name' => 'Review Architecture'],
                ['name' => 'review_code', 'display_name' => 'Review Source Code'],
                ['name' => 'commit_code', 'display_name' => 'Commit Code'],
                ['name' => 'review_pull_request', 'display_name' => 'Review Pull Request'],
                ['name' => 'approve_merge', 'display_name' => 'Approve Merge'],
                ['name' => 'approve_release', 'display_name' => 'Approve Release'],
                ['name' => 'upload_documentation', 'display_name' => 'Upload Documentation'],
            ],


            // Infrastructure
            'infrastructure' => [
                ['name' => 'view_infrastructure', 'display_name' => 'View Infrastructure'],
                ['name' => 'approve_design', 'display_name' => 'Approve Infrastructure Design'],
                ['name' => 'network_configuration', 'display_name' => 'Network Configuration'],
                ['name' => 'server_installation', 'display_name' => 'Server Installation'],
                ['name' => 'firewall_configuration', 'display_name' => 'Firewall Configuration'],
                ['name' => 'upload_configuration', 'display_name' => 'Upload Configuration'],
            ],


            // IT Operations
            'operations' => [
                ['name' => 'view_tickets', 'display_name' => 'View Support Tickets'],
                ['name' => 'assign_ticket', 'display_name' => 'Assign Ticket'],
                ['name' => 'accept_ticket', 'display_name' => 'Accept Ticket'],
                ['name' => 'update_ticket', 'display_name' => 'Update Ticket'],
                ['name' => 'resolve_ticket', 'display_name' => 'Resolve Ticket'],
                ['name' => 'close_ticket', 'display_name' => 'Close Ticket'],
                ['name' => 'approve_maintenance', 'display_name' => 'Approve Maintenance'],
            ],


            // Cloud Management
            'cloud' => [
                ['name' => 'approve_cloud_resource', 'display_name' => 'Approve Cloud Resource'],
                ['name' => 'provision_server', 'display_name' => 'Provision Server'],
                ['name' => 'deploy_application', 'display_name' => 'Deploy Application'],
                ['name' => 'backup_system', 'display_name' => 'Backup System'],
                ['name' => 'restore_system', 'display_name' => 'Restore System'],
                ['name' => 'scale_resource', 'display_name' => 'Scale Resources'],
            ],


            // Quality
            'quality' => [
                ['name' => 'view_quality_review', 'display_name' => 'View Quality Review'],
                ['name' => 'conduct_quality_test', 'display_name' => 'Conduct Quality Test'],
                ['name' => 'audit_documents', 'display_name' => 'Audit Documents'],
                ['name' => 'verify_compliance', 'display_name' => 'Verify Compliance'],
                ['name' => 'approve_quality', 'display_name' => 'Approve Quality'],
                ['name' => 'reject_quality', 'display_name' => 'Reject Quality'],
                ['name' => 'generate_audit_report', 'display_name' => 'Generate Audit Report'],
            ],


            // Reports
            'reports' => [
                ['name' => 'view_reports', 'display_name' => 'View Reports'],
                ['name' => 'generate_reports', 'display_name' => 'Generate Reports'],
                ['name' => 'export_reports', 'display_name' => 'Export Reports'],
            ],


            // System
            'system' => [
                ['name' => 'manage_settings', 'display_name' => 'Manage System Settings'],
                ['name' => 'archive_records', 'display_name' => 'Archive Records'],
            ],

            // Notifications
            'notifications' => [
                ['name' => 'view_notifications', 'display_name' => 'View Notifications'],
                ['name' => 'send_notifications', 'display_name' => 'Send Notifications'],
            ],
        ];


        $permissions = [];

        foreach ($permissionGroups as $module => $items) {

            foreach ($items as $permission) {

                $permissions[$permission['name']] = Permission::firstOrCreate(
                    [
                        'name' => $permission['name']
                    ],
                    [
                        'display_name' => $permission['display_name'],
                        'module' => $module,
                        'description' => $permission['display_name'],
                    ]
                );
            }
        }


        return $permissions;
    }

    /**
     * Create all roles according to Smart City technology lifecycle.
     */
    /**
     * Create all organizational roles.
     */
    protected function createRoles(): array
    {
        $roles = [

            // ==================================================
            // BUREAU LEVEL
            // ==================================================

            'bureau_head' => [
                'display_name' => 'Bureau Head',
                'description' => 'Leads Innovation and Technology Development Bureau. Approves strategic decisions, budgets, projects and final reports.'
            ],


            // ==================================================
            // SMART CITY SECTOR
            // ==================================================

            'smart_city_sector_head' => [
                'display_name' => 'Smart City Sector Head',
                'description' => 'Manages Smart City sector requests, coordination and strategic technology initiatives.'
            ],

            'smart_city_officer' => [
                'display_name' => 'Smart City Officer',
                'description' => 'Implements smart city initiatives and coordinates with stakeholders.'
            ],


            // ==================================================
            // CAPACITY BUILDING AND TRAINING
            // ==================================================

            'capacity_building_director' => [
                'display_name' => 'Capacity Building and Training Director',
                'description' => 'Plans ICT training programs, approves training activities and monitors training performance.'
            ],

            'training_team_leader' => [
                'display_name' => 'Training Team Leader',
                'description' => 'Coordinates training officers, schedules training and monitors execution.'
            ],

            'training_officer' => [
                'display_name' => 'Training Officer',
                'description' => 'Conducts training, prepares materials and submits completion reports.'
            ],


            // ==================================================
            // RESEARCH DIRECTORATE
            // ==================================================

            'research_director' => [
                'display_name' => 'Research Director',
                'description' => 'Manages innovation research, feasibility studies and technology recommendations.'
            ],

            'research_team_leader' => [
                'display_name' => 'Research Team Leader',
                'description' => 'Coordinates research officers, assigns research tasks and monitors progress.'
            ],

            'research_officer' => [
                'display_name' => 'Research Officer',
                'description' => 'Conducts feasibility studies, technology assessment and research documentation.'
            ],


            // ==================================================
            // INFORMATION SYSTEM SECURITY
            // ==================================================

            'security_director' => [
                'display_name' => 'Information System Security Director',
                'description' => 'Manages cybersecurity reviews, compliance and security approvals.'
            ],

            'security_officer' => [
                'display_name' => 'Security Officer',
                'description' => 'Performs security assessments, vulnerability testing and security reporting.'
            ],


            // ==================================================
            // DEVELOPMENT SECTOR
            // ==================================================

            'development_sector_head' => [
                'display_name' => 'Innovation and Technology Development Sector Head',
                'description' => 'Oversees project implementation and technology development activities.'
            ],


            // ==================================================
            // PROJECT MANAGEMENT DIRECTORATE
            // ==================================================

            'project_director' => [
                'display_name' => 'IT Project Management Director',
                'description' => 'Registers projects, manages resources and approves project deliverables.'
            ],

            'project_manager' => [
                'display_name' => 'Project Manager',
                'description' => 'Manages project tasks, timelines, risks, budgets and team activities.'
            ],


            // ==================================================
            // SOFTWARE DEVELOPMENT DIRECTORATE
            // ==================================================

            'software_development_director' => [
                'display_name' => 'Software Development Director',
                'description' => 'Manages software architecture, development teams and release approvals.'
            ],

            'software_team_leader' => [
                'display_name' => 'Software Development Team Leader',
                'description' => 'Coordinates developers, reviews code and manages sprint activities.'
            ],

            'software_developer' => [
                'display_name' => 'Software Developer',
                'description' => 'Develops applications, APIs, database solutions and performs testing.'
            ],


            // ==================================================
            // INFRASTRUCTURE DIRECTORATE
            // ==================================================

            'infrastructure_director' => [
                'display_name' => 'Infrastructure Development Director',
                'description' => 'Approves infrastructure design and manages infrastructure activities.'
            ],

            'infrastructure_engineer' => [
                'display_name' => 'Infrastructure Engineer',
                'description' => 'Handles servers, networks, virtualization and infrastructure deployment.'
            ],


            // ==================================================
            // IT OPERATION AND SERVICE SECTOR
            // ==================================================

            'operation_sector_head' => [
                'display_name' => 'IT Operation and Service Sector Head',
                'description' => 'Monitors ICT services, incidents and service performance.'
            ],


            // ==================================================
            // OPERATION AND MAINTENANCE
            // ==================================================

            'maintenance_director' => [
                'display_name' => 'IT Operation and Maintenance Director',
                'description' => 'Manages ICT support operations and incident resolution.'
            ],

            'maintenance_team_leader' => [
                'display_name' => 'Maintenance Team Leader',
                'description' => 'Assigns technicians and monitors support activities.'
            ],

            'support_officer' => [
                'display_name' => 'Support Officer',
                'description' => 'Resolves incidents, configures systems and supports users.'
            ],


            // ==================================================
            // DATA CENTER AND CLOUD
            // ==================================================

            'data_center_director' => [
                'display_name' => 'Data Center and Cloud Director',
                'description' => 'Approves hosting, cloud resources and infrastructure services.'
            ],

            'cloud_engineer' => [
                'display_name' => 'Cloud Engineer',
                'description' => 'Manages cloud resources, deployments, backups and monitoring.'
            ],


            // ==================================================
            // QUALITY UNIT
            // ==================================================

            'quality_director' => [
                'display_name' => 'Quality Director',
                'description' => 'Reviews completed projects, compliance, testing and final acceptance.'
            ],

            'quality_officer' => [
                'display_name' => 'Quality Officer',
                'description' => 'Performs quality testing, documentation review and audit reporting.'
            ],

        ];


        $createdRoles = [];


        foreach ($roles as $name => $role) {

            $createdRoles[$name] = Role::firstOrCreate(
                [
                    'name' => $name
                ],
                [
                    'display_name' => $role['display_name'],
                    'description' => $role['description'],
                ]
            );
        }


        return $createdRoles;
    }

    /**
     * Assign permissions to roles according to organizational hierarchy.
     */
    protected function assignPermissions(array $roles, array $permissions): void
    {

        /*
    |--------------------------------------------------------------------------
    | Bureau Head - Full System Authority
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['bureau_head'],
            $permissions,
            array_keys($permissions)
        );


        /*
    |--------------------------------------------------------------------------
    | Smart City Sector Head
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['smart_city_sector_head'],
            $permissions,
            [
                'view_dashboard',
                'view_requests',
                'receive_requests',
                'assign_requests',
                'reassign_requests',
                'approve_requests',
                'reject_requests',
                'return_requests',
                'change_request_priority',
                'view_research',
                'create_research_ideas',
                'edit_research_ideas',
                'submit_research_ideas',
                'assign_research',
                'approve_research',
                'approve_feasibility',
                'manage_workflow_stages',
                // Reviews the final evaluation report when it's restricted to
                // Research Director only — the director can't review their own
                // submission, so that review escalates to Smart City instead.
                'review_research_stage',
                'view_reports',
                'generate_reports',
                'view_notifications',
                'send_notifications',
                'view_users',
                'create_users',
                'edit_users',
                'delete_users',
            ]
        );

        /*
    |--------------------------------------------------------------------------
    | Smart City Officer
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['smart_city_officer'],
            $permissions,
            [
                'view_dashboard',
                'view_requests',
                'receive_requests',
                'view_research',
                'create_research_ideas',
                'edit_research_ideas',
                'submit_research_ideas',
                'view_reports',
                'view_notifications',
                'send_notifications',
            ]
        );


        /*
    |--------------------------------------------------------------------------
    | Capacity Building Director
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['capacity_building_director'],
            $permissions,
            [
                'view_dashboard',
                'view_training',
                'create_training',
                'edit_training',
                'assign_training_officer',
                'approve_training',
                'cancel_training',
                'generate_certificate',
                'view_reports',
                'generate_reports',
                'view_notifications',
                'send_notifications',
                'view_users',
                'create_users',
                'edit_users',
                'delete_users'
            ]
        );


        /*
    |--------------------------------------------------------------------------
    | Training Team Leader
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['training_team_leader'],
            $permissions,
            [
                'view_dashboard',
                'view_training',
                'assign_training_officer',
                'schedule_training',
                'upload_attendance',
                'complete_training',
                'view_reports',
                'view_notifications',
                'send_notifications',
                'view_users',
                'create_users',
                'edit_users',
                'delete_users'
            ]
        );


        /*
    |--------------------------------------------------------------------------
    | Training Officer
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['training_officer'],
            $permissions,
            [
                'view_training',
                'upload_training_material',
                'upload_attendance',
                'complete_training',
                'view_notifications',
                'send_notifications'
            ]
        );



        /*
    |--------------------------------------------------------------------------
    | Research / Evaluation Director
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['research_director'],
            $permissions,
            [
                'view_research',
                'create_research_ideas',
                'edit_research_ideas',
                'delete_research_ideas',
                'assign_research',
                'approve_research',
                'approve_feasibility',
                'forward_project',
                'technology_assessment',
                'cost_benefit_analysis',
                'risk_analysis',
                'assign_team_leader',
                'manage_research_workflow',
                'manage_workflow_stages',
                'update_research_progress',
                'submit_research_stage',
                'review_research_stage',
                'approve_research_stage',
                'forward_to_smart_city',
                'view_research_reports',
                'generate_research_reports',
                // Evaluation specific permissions
                'view_evaluations',
                'review_evaluation',
                'approve_evaluation',
                'reject_evaluation',
                'issue_clearance',
                'view_reports',
                'generate_reports',
                'view_notifications',
                'send_notifications',
                'view_users',
                'create_users',
                'edit_users',
                'delete_users'
            ]
        );

    /**
     * research_team_leader role permissions
     */

        $this->assignPermissionsToRole(
            $roles['research_team_leader'],
            $permissions,
            [
                'view_research',
                'create_research_ideas',
                'edit_research_ideas',
                'submit_research_ideas',
                'assign_research',
                'conduct_research',
                'technology_assessment',
                'cost_benefit_analysis',
                'risk_analysis',
                'submit_feasibility',
                'assign_officer',
                'view_assigned_research',
                'update_research_progress',
                'submit_research_stage',
                'review_research_stage',
                'manage_research_workflow',
                // Evaluation specific permissions
                'view_assigned_evaluation',
                'update_evaluation',
                'review_assessment',
                'submit_report',
                'view_notifications',
                'send_notifications',
                'view_users',
                'create_users',
                'edit_users',
            ]
        );


        /*
    |--------------------------------------------------------------------------
    | Research / Evaluation Officer
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['research_officer'],
            $permissions,
            [
                'view_research',
                'create_research_ideas',
                'edit_research_ideas',
                'conduct_research',
                'technology_assessment',
                'view_assigned_research',
                'update_research_progress',
                'submit_research_stage',
                // Evaluation specific permissions
                'view_assigned_task',
                'update_assessment',
                'upload_documents',
                'submit_assessment',
                'view_notifications',
                'send_notifications'
            ]
        );



        /*
    |--------------------------------------------------------------------------
    | Security Director
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['security_director'],
            $permissions,
            [
                'view_security_review',
                'assign_security_review',
                'approve_security',
                'reject_security',
                'issue_security_clearance',
                'view_reports',
                'generate_reports',
                'view_notifications',
                'send_notifications',
                'view_users',
                'create_users',
                'edit_users',
                'delete_users'
            ]
        );


        /*
    |--------------------------------------------------------------------------
    | Security Officer
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['security_officer'],
            $permissions,
            [
                'view_security_review',
                'security_assessment',
                'vulnerability_assessment',
                'penetration_testing',
                'view_notifications',
                'send_notifications'
            ]
        );



        /*
    |--------------------------------------------------------------------------
    | Development Sector Head
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['development_sector_head'],
            $permissions,
            [
                'view_projects',
                'assign_project',
                'approve_milestone',
                'approve_deliverable',
                'close_project',
                'generate_reports',
                'view_notifications',
                'send_notifications',
                'view_users',
                'create_users',
                'edit_users',
                'delete_users'
            ]
        );



        /*
    |--------------------------------------------------------------------------
    | Project Director
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['project_director'],
            $permissions,
            [
                'view_projects',
                'create_project',
                'edit_project',
                'assign_project_manager',
                'update_project_timeline',
                'approve_milestone',
                'approve_deliverable',
                'close_project',
                'view_notifications',
                'send_notifications',
                'view_users',
                'create_users',
                'edit_users',
                'delete_users'
            ]
        );



        /*
    |--------------------------------------------------------------------------
    | Project Manager
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['project_manager'],
            $permissions,
            [
                'view_projects',
                'create_tasks',
                'assign_tasks',
                'update_task_status',
                'submit_task',
                'approve_deliverable',
                'update_project_timeline',
                'view_notifications',
                'send_notifications',
                'view_users',
                'create_users',
                'edit_users',
                'delete_users'
            ]
        );



        /*
    |--------------------------------------------------------------------------
    | Software Development Director
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['software_development_director'],
            $permissions,
            [
                'assign_developer',
                'review_architecture',
                'review_code',
                'approve_merge',
                'approve_release',
                'view_notifications',
                'send_notifications',
                'view_users',
                'create_users',
                'edit_users',
                'delete_users'
            ]
        );



        /*
    |--------------------------------------------------------------------------
    | Software Team Leader
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['software_team_leader'],
            $permissions,
            [
                'assign_tasks',
                'review_code',
                'review_pull_request',
                'approve_merge',
                'update_task_status',
                'view_notifications',
                'send_notifications',
                'view_users',
                'create_users',
                'edit_users',
                'delete_users'
            ]
        );



        /*
    |--------------------------------------------------------------------------
    | Software Developer
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['software_developer'],
            $permissions,
            [
                'commit_code',
                'submit_task',
                'upload_documentation',
                'update_task_status',
                'view_notifications',
                'send_notifications'
            ]
        );



        /*
    |--------------------------------------------------------------------------
    | Infrastructure Director
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['infrastructure_director'],
            $permissions,
            [
                'view_infrastructure',
                'approve_design',
                'network_configuration',
                'server_installation',
                'view_notifications',
                'send_notifications',
                'view_users',
                'create_users',
                'edit_users',
                'delete_users'
            ]
        );



        /*
    |--------------------------------------------------------------------------
    | Infrastructure Engineer
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['infrastructure_engineer'],
            $permissions,
            [
                'network_configuration',
                'server_installation',
                'firewall_configuration',
                'upload_configuration',
                'view_notifications',
                'send_notifications'
            ]
        );



        /*
    |--------------------------------------------------------------------------
    | Operation Sector Head
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['operation_sector_head'],
            $permissions,
            [
                'view_tickets',
                'assign_ticket',
                'approve_maintenance',
                'generate_reports',
                'view_notifications',
                'send_notifications',
                'view_users',
                'create_users',
                'edit_users',
                'delete_users'
            ]
        );



        /*
    |--------------------------------------------------------------------------
    | Maintenance Director
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['maintenance_director'],
            $permissions,
            [
                'view_tickets',
                'assign_ticket',
                'close_ticket',
                'approve_maintenance',
                'view_notifications',
                'send_notifications',
                'view_users',
                'create_users',
                'edit_users',
                'delete_users'
            ]
        );



        /*
    |--------------------------------------------------------------------------
    | Maintenance Team Leader
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['maintenance_team_leader'],
            $permissions,
            [
                'assign_ticket',
                'update_ticket',
                'resolve_ticket',
                'view_notifications',
                'send_notifications',
                'view_users',
                'create_users',
                'edit_users',
                'delete_users'
            ]
        );



        /*
    |--------------------------------------------------------------------------
    | Support Officer
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['support_officer'],
            $permissions,
            [
                'accept_ticket',
                'update_ticket',
                'resolve_ticket',
                'close_ticket',
                'view_notifications',
                'send_notifications'
            ]
        );



        /*
    |--------------------------------------------------------------------------
    | Data Center Director
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['data_center_director'],
            $permissions,
            [
                'approve_cloud_resource',
                'view_infrastructure',
                'generate_reports',
                'view_notifications',
                'send_notifications',
                'view_users',
                'create_users',
                'edit_users',
                'delete_users'
            ]
        );



        /*
    |--------------------------------------------------------------------------
    | Cloud Engineer
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['cloud_engineer'],
            $permissions,
            [
                'provision_server',
                'deploy_application',
                'backup_system',
                'restore_system',
                'scale_resource',
                'view_notifications',
                'send_notifications'
            ]
        );



        /*
    |--------------------------------------------------------------------------
    | Quality Director
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['quality_director'],
            $permissions,
            [
                'view_quality_review',
                'audit_documents',
                'verify_compliance',
                'approve_quality',
                'reject_quality',
                'generate_audit_report',
                'view_notifications',
                'send_notifications',
                'view_users',
                'create_users',
                'edit_users',
                'delete_users'
            ]
        );



        /*
    |--------------------------------------------------------------------------
    | Quality Officer
    |--------------------------------------------------------------------------
    */

        $this->assignPermissionsToRole(
            $roles['quality_officer'],
            $permissions,
            [
                'view_quality_review',
                'conduct_quality_test',
                'audit_documents',
                'generate_audit_report',
                'view_notifications',
                'send_notifications'
            ]
        );


        $this->command->info('✓ All permissions assigned successfully');
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
