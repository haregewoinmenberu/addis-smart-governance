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
                ['name' => 'view_auditor_dashboard', 'display_name' => 'View Auditor Dashboard'],
                ['name' => 'view_institution_dashboard', 'display_name' => 'View Institution Dashboard'],
                ['name' => 'view_research_dashboard', 'display_name' => 'View Research Dashboard'],
                ['name' => 'view_licensing_dashboard', 'display_name' => 'View Licensing Dashboard'],
                ['name' => 'view_technology_transfer_dashboard', 'display_name' => 'View Technology Transfer Dashboard'],
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
            ],

            // Technology Requests
            'requests' => [
                ['name' => 'view_requests', 'display_name' => 'View Requests'],
                ['name' => 'create_requests', 'display_name' => 'Create Requests'],
                ['name' => 'edit_requests', 'display_name' => 'Edit Requests'],
                ['name' => 'delete_requests', 'display_name' => 'Delete Requests'],
                ['name' => 'submit_requests', 'display_name' => 'Submit Requests'],
                ['name' => 'view_all_requests', 'display_name' => 'View All Requests (System-wide)'],
                ['name' => 'classify_requests', 'display_name' => 'Classify Requests (Smart City Command Center)'],
                ['name' => 'route_requests', 'display_name' => 'Route Requests to Workflows'],
                ['name' => 'manage_command_center', 'display_name' => 'Manage Smart City Command Center'],
            ],

            // Research & Assessment
            'research' => [
                ['name' => 'view_research', 'display_name' => 'View Research'],
                ['name' => 'create_research', 'display_name' => 'Create Research'],
                ['name' => 'manage_research', 'display_name' => 'Manage Research'],
                ['name' => 'approve_research', 'display_name' => 'Approve Research'],
                ['name' => 'conduct_research', 'display_name' => 'Conduct Research'],
                ['name' => 'assess_technology', 'display_name' => 'Assess Technology'],
                ['name' => 'view_all_research', 'display_name' => 'View All Research (System-wide)'],
            ],

            // Technology Transfer
            'technology_transfer' => [
                ['name' => 'view_technology_transfer', 'display_name' => 'View Technology Transfer'],
                ['name' => 'manage_technology_transfer', 'display_name' => 'Manage Technology Transfer'],
                ['name' => 'approve_technology_transfer', 'display_name' => 'Approve Technology Transfer'],
                ['name' => 'issue_certificates', 'display_name' => 'Issue Technology Certificates'],
            ],

            // Architecture & Development
            'architecture' => [
                ['name' => 'review_architecture', 'display_name' => 'Review Architecture'],
                ['name' => 'approve_architecture', 'display_name' => 'Approve Architecture'],
                ['name' => 'manage_development', 'display_name' => 'Manage Development'],
            ],

            // Quality & Verification
            'quality' => [
                ['name' => 'conduct_verification', 'display_name' => 'Conduct Verification'],
                ['name' => 'approve_quality', 'display_name' => 'Approve Quality'],
            ],

            // Governance & Compliance
            'governance' => [
                ['name' => 'review_governance', 'display_name' => 'Review Governance'],
                ['name' => 'make_governance_decision', 'display_name' => 'Make Governance Decision'],
                ['name' => 'conduct_compliance_check', 'display_name' => 'Conduct Compliance Check'],
                ['name' => 'conduct_risk_assessment', 'display_name' => 'Conduct Risk Assessment'],
                ['name' => 'conduct_legal_review', 'display_name' => 'Conduct Legal Review'],
            ],

            // Institutions
            'institutions' => [
                ['name' => 'view_institutions', 'display_name' => 'View Institutions'],
                ['name' => 'create_institutions', 'display_name' => 'Create Institutions'],
                ['name' => 'verify_institutions', 'display_name' => 'Verify Institutions'],
                ['name' => 'manage_institutions', 'display_name' => 'Manage Institutions'],
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
     * Create all roles according to Smart City technology lifecycle.
     */
    protected function createRoles(): array
    {
        return [
            // Top Level
            'itdb_administrator' => Role::firstOrCreate(
                ['name' => 'itdb_administrator'],
                [
                    'display_name' => 'ITDB Administrator',
                    'description' => 'Top authority with full system access. Oversees all operations and makes final decisions.',
                ]
            ),

            'smart_city_sector_director' => Role::firstOrCreate(
                ['name' => 'smart_city_sector_director'],
                [
                    'display_name' => 'Smart City Sector Director',
                    'description' => 'Oversees Smart City sector operations and strategic direction.',
                ]
            ),

            // Smart City Command Center (Entry Point)
            'smart_city_command_center' => Role::firstOrCreate(
                ['name' => 'smart_city_command_center'],
                [
                    'display_name' => 'Smart City Command Center',
                    'description' => 'Entry point for all requests. Receives, classifies, and routes requests. Monitors operations and manages service lifecycle.',
                ]
            ),

            // Research & Assessment
            'research_director' => Role::firstOrCreate(
                ['name' => 'research_director'],
                [
                    'display_name' => 'Research Director',
                    'description' => 'Leads research operations, assigns projects, and oversees technology assessment.',
                ]
            ),

            'research_lead' => Role::firstOrCreate(
                ['name' => 'research_lead'],
                [
                    'display_name' => 'Research Lead',
                    'description' => 'Leads research projects and teams.',
                ]
            ),

            'researcher' => Role::firstOrCreate(
                ['name' => 'researcher'],
                [
                    'display_name' => 'Researcher',
                    'description' => 'Conducts research and technology assessment.',
                ]
            ),

            // Technology Transfer
            'technology_transfer_manager' => Role::firstOrCreate(
                ['name' => 'technology_transfer_manager'],
                [
                    'display_name' => 'Technology Transfer Manager',
                    'description' => 'Manages technology transfer, registry, and deployment processes.',
                ]
            ),

            // Architecture & Development
            'enterprise_architect' => Role::firstOrCreate(
                ['name' => 'enterprise_architect'],
                [
                    'display_name' => 'Enterprise Architect',
                    'description' => 'Designs and evaluates enterprise architecture.',
                ]
            ),

            'system_architect' => Role::firstOrCreate(
                ['name' => 'system_architect'],
                [
                    'display_name' => 'System Architect',
                    'description' => 'Designs and architects systems and solutions.',
                ]
            ),

            'software_developer' => Role::firstOrCreate(
                ['name' => 'software_developer'],
                [
                    'display_name' => 'Software Developer',
                    'description' => 'Develops and implements software solutions.',
                ]
            ),

            // Quality & Verification
            'verification_officer' => Role::firstOrCreate(
                ['name' => 'verification_officer'],
                [
                    'display_name' => 'Verification Officer',
                    'description' => 'Conducts quality verification and testing.',
                ]
            ),

            // Governance & Control
            'itdb_auditor' => Role::firstOrCreate(
                ['name' => 'itdb_auditor'],
                [
                    'display_name' => 'ITDB Auditor',
                    'description' => 'Performs system audits and compliance checks.',
                ]
            ),

            'governance_committee' => Role::firstOrCreate(
                ['name' => 'governance_committee'],
                [
                    'display_name' => 'Governance Committee',
                    'description' => 'Makes governance decisions, approves or rejects technology adoption.',
                ]
            ),

            'review_committee' => Role::firstOrCreate(
                ['name' => 'review_committee'],
                [
                    'display_name' => 'Review Committee',
                    'description' => 'Reviews proposals, research, and technology submissions.',
                ]
            ),

            'security_officer' => Role::firstOrCreate(
                ['name' => 'security_officer'],
                [
                    'display_name' => 'Security Officer',
                    'description' => 'Evaluates security aspects of technology and systems.',
                ]
            ),

            'risk_officer' => Role::firstOrCreate(
                ['name' => 'risk_officer'],
                [
                    'display_name' => 'Risk Officer',
                    'description' => 'Assesses and manages risks.',
                ]
            ),

            'compliance_officer' => Role::firstOrCreate(
                ['name' => 'compliance_officer'],
                [
                    'display_name' => 'Compliance Officer',
                    'description' => 'Ensures compliance with regulations and standards.',
                ]
            ),

            'legal_officer' => Role::firstOrCreate(
                ['name' => 'legal_officer'],
                [
                    'display_name' => 'Legal Officer',
                    'description' => 'Provides legal review and guidance.',
                ]
            ),

            // External Ecosystem
            'institutional_user' => Role::firstOrCreate(
                ['name' => 'institutional_user'],
                [
                    'display_name' => 'Institutional User',
                    'description' => 'External organization user who can submit requests and track progress.',
                ]
            ),

            'vendor' => Role::firstOrCreate(
                ['name' => 'vendor'],
                [
                    'display_name' => 'Vendor',
                    'description' => 'External vendor who can submit technology solutions.',
                ]
            ),
        ];
    }

    /**
     * Assign permissions to roles based on Smart City hierarchy.
     */
    protected function assignPermissions(array $roles, array $permissions): void
    {
        // 1. ITDB Administrator - Full System Access
        $itdbAdminPermissions = [
            'view_dashboard', 'view_executive_dashboard',
            'view_users', 'create_users', 'edit_users', 'delete_users', 'manage_roles', 'view_all_users', 'create_itdb_users',
            'view_requests', 'create_requests', 'edit_requests', 'delete_requests', 'submit_requests', 'view_all_requests', 
            'classify_requests', 'route_requests', 'manage_command_center',
            'view_workflows', 'create_workflows', 'edit_workflows', 'delete_workflows', 'approve_workflows', 
            'final_approval', 'override_workflows', 'cancel_workflows',
            'view_duplication', 'perform_duplication_analysis', 'override_duplication_analysis',
            'view_feasibility', 'conduct_feasibility', 'approve_feasibility',
            'view_technologies', 'create_technologies', 'edit_technologies', 'delete_technologies', 'view_all_technologies',
            'view_audits', 'create_audits', 'conduct_audits', 'approve_audits', 'view_all_audits',
            'view_research', 'create_research', 'manage_research', 'approve_research', 'conduct_research', 
            'assess_technology', 'view_all_research',
            'view_technology_transfer', 'manage_technology_transfer', 'approve_technology_transfer', 'issue_certificates',
            'review_architecture', 'approve_architecture', 'manage_development',
            'conduct_verification', 'approve_quality',
            'review_governance', 'make_governance_decision', 'conduct_compliance_check', 
            'conduct_risk_assessment', 'conduct_legal_review',
            'view_institutions', 'create_institutions', 'verify_institutions', 'manage_institutions',
            'view_vendors', 'create_vendors', 'edit_vendors', 'approve_vendors',
            'view_surveys', 'create_surveys', 'manage_surveys', 'participate_surveys', 'collect_survey_data',
            'view_reports', 'create_reports', 'export_reports', 'view_system_reports',
            'view_cybersecurity', 'manage_cybersecurity', 'resolve_cybersecurity',
            'view_notifications', 'send_notifications',
            'view_settings', 'manage_settings',
            'encode_data', 'collect_field_data', 'gather_feedback',
        ];

        // 2. Smart City Sector Director
        $sectorDirectorPermissions = [
            'view_dashboard', 'view_executive_dashboard',
            'view_users', 'view_all_users',
            'view_requests', 'view_all_requests', 'manage_command_center',
            'view_workflows', 'approve_workflows', 'final_approval', 'override_workflows',
            'view_technologies', 'view_all_technologies',
            'view_research', 'approve_research', 'view_all_research',
            'approve_technology_transfer',
            'approve_architecture',
            'make_governance_decision',
            'view_institutions',
            'view_reports', 'view_system_reports',
            'view_notifications',
        ];

        // 3. Smart City Command Center - Entry Point & Operations Manager
        $commandCenterPermissions = [
            'view_dashboard',
            'view_users',
            'view_requests', 'create_requests', 'edit_requests', 'submit_requests', 'view_all_requests',
            'classify_requests', 'route_requests', 'manage_command_center',
            'view_workflows', 'approve_workflows',
            'view_technologies', 'view_all_technologies',
            'view_research', 'create_research', 'view_all_research',
            'view_technology_transfer',
            'view_institutions', 'verify_institutions',
            'view_reports', 'create_reports', 'export_reports',
            'view_notifications', 'send_notifications',
        ];

        // 4. Research Director
        $researchDirectorPermissions = [
            'view_dashboard', 'view_research_dashboard',
            'view_requests', 'view_all_requests',
            'view_workflows', 'approve_workflows',
            'view_technologies',
            'view_research', 'create_research', 'manage_research', 'approve_research', 'conduct_research',
            'assess_technology', 'view_all_research',
            'view_reports', 'create_reports',
            'view_notifications',
        ];

        // 5. Research Lead
        $researchLeadPermissions = [
            'view_dashboard', 'view_research_dashboard',
            'view_requests',
            'view_workflows',
            'view_research', 'create_research', 'conduct_research', 'assess_technology',
            'view_reports', 'create_reports',
            'view_notifications',
        ];

        // 6. Researcher
        $researcherPermissions = [
            'view_dashboard',
            'view_research_dashboard',

            'view_research',
            'conduct_research',

            'view_research_ideas',
            'create_research_ideas',
            'edit_research_ideas',

            'view_research_projects',

            'manage_tasks',
            'manage_experiments',

            'submit_progress_reports',

            'view_reports',
            'view_notifications',
        ];

        // 7. Technology Transfer Manager
        $technologyTransferPermissions = [
            'view_dashboard', 'view_technology_transfer_dashboard',
            'view_requests', 'view_all_requests',
            'view_workflows', 'approve_workflows',
            'view_technologies', 'create_technologies', 'edit_technologies', 'view_all_technologies',
            'view_technology_transfer', 'manage_technology_transfer', 'approve_technology_transfer', 'issue_certificates',
            'view_reports', 'create_reports',
            'view_notifications',
        ];

        // 8. Enterprise Architect
        $enterpriseArchitectPermissions = [
            'view_dashboard',
            'view_requests', 'view_all_requests',
            'view_workflows', 'approve_workflows',
            'view_technologies',
            'review_architecture', 'approve_architecture', 'manage_development',
            'view_reports', 'create_reports',
            'view_notifications',
        ];

        // 9. System Architect
        $systemArchitectPermissions = [
            'view_dashboard',
            'view_requests',
            'view_workflows', 'approve_workflows',
            'view_technologies',
            'review_architecture', 'manage_development',
            'view_reports', 'create_reports',
            'view_notifications',
        ];

        // 10. Software Developer
        $developerPermissions = [
            'view_dashboard',
            'view_requests',
            'view_workflows',
            'manage_development',
            'view_notifications',
        ];

        // 11. Verification Officer
        $verificationOfficerPermissions = [
            'view_dashboard',
            'view_requests', 'view_all_requests',
            'view_workflows', 'approve_workflows',
            'view_technologies',
            'conduct_verification', 'approve_quality',
            'view_reports', 'create_reports',
            'view_notifications',
        ];

        // 12. ITDB Auditor
        $itdbAuditorPermissions = [
            'view_dashboard', 'view_auditor_dashboard',
            'view_requests', 'view_all_requests',
            'view_workflows', 'approve_workflows',
            'view_duplication', 'perform_duplication_analysis', 'override_duplication_analysis',
            'view_feasibility', 'conduct_feasibility', 'approve_feasibility',
            'view_technologies', 'view_all_technologies',
            'view_audits', 'create_audits', 'conduct_audits', 'view_all_audits',
            'view_vendors', 'approve_vendors',
            'view_surveys',
            'view_reports', 'create_reports', 'export_reports', 'view_system_reports',
            'view_cybersecurity', 'manage_cybersecurity', 'resolve_cybersecurity',
            'view_notifications',
            'view_settings',
        ];

        // 13. Governance Committee
        $governanceCommitteePermissions = [
            'view_dashboard',
            'view_requests', 'view_all_requests',
            'view_workflows', 'approve_workflows',
            'view_technologies', 'view_all_technologies',
            'review_governance', 'make_governance_decision',
            'view_reports',
            'view_notifications',
        ];

        // 14. Review Committee
        $reviewCommitteePermissions = [
            'view_dashboard',
            'view_requests', 'view_all_requests',
            'view_workflows', 'approve_workflows',
            'view_technologies',
            'view_research', 'approve_research', 'view_all_research',
            'review_governance',
            'view_reports',
            'view_notifications',
        ];

        // 15. Security Officer
        $securityOfficerPermissions = [
            'view_dashboard',
            'view_requests', 'view_all_requests',
            'view_workflows', 'approve_workflows',
            'view_technologies',
            'view_cybersecurity', 'manage_cybersecurity', 'resolve_cybersecurity',
            'conduct_compliance_check',
            'view_reports', 'create_reports',
            'view_notifications',
        ];

        // 16. Risk Officer
        $riskOfficerPermissions = [
            'view_dashboard',
            'view_requests', 'view_all_requests',
            'view_workflows', 'approve_workflows',
            'view_technologies',
            'conduct_risk_assessment',
            'view_reports', 'create_reports',
            'view_notifications',
        ];

        // 17. Compliance Officer
        $complianceOfficerPermissions = [
            'view_dashboard',
            'view_requests', 'view_all_requests',
            'view_workflows', 'approve_workflows',
            'view_technologies',
            'conduct_compliance_check',
            'view_reports', 'create_reports',
            'view_notifications',
        ];

        // 18. Legal Officer
        $legalOfficerPermissions = [
            'view_dashboard',
            'view_requests', 'view_all_requests',
            'view_workflows', 'approve_workflows',
            'view_technologies',
            'conduct_legal_review',
            'view_reports', 'create_reports',
            'view_notifications',
        ];

        // 19. Institutional User (External Organizations)
        $institutionalUserPermissions = [
            'view_dashboard', 'view_institution_dashboard',
            'view_requests', 'create_requests', 'edit_requests', 'submit_requests',
            'view_notifications',
        ];

        // 20. Vendor (External Technology Providers)
        $vendorPermissions = [
            'view_dashboard',
            'view_requests', 'create_requests', 'edit_requests', 'submit_requests',
            'view_technologies',
            'view_notifications',
        ];

        // Assign permissions to all roles
        $this->assignPermissionsToRole($roles['itdb_administrator'], $permissions, $itdbAdminPermissions);
        $this->assignPermissionsToRole($roles['smart_city_sector_director'], $permissions, $sectorDirectorPermissions);
        $this->assignPermissionsToRole($roles['smart_city_command_center'], $permissions, $commandCenterPermissions);
        $this->assignPermissionsToRole($roles['research_director'], $permissions, $researchDirectorPermissions);
        $this->assignPermissionsToRole($roles['research_lead'], $permissions, $researchLeadPermissions);
        $this->assignPermissionsToRole($roles['researcher'], $permissions, $researcherPermissions);
        $this->assignPermissionsToRole($roles['technology_transfer_manager'], $permissions, $technologyTransferPermissions);
        $this->assignPermissionsToRole($roles['enterprise_architect'], $permissions, $enterpriseArchitectPermissions);
        $this->assignPermissionsToRole($roles['system_architect'], $permissions, $systemArchitectPermissions);
        $this->assignPermissionsToRole($roles['software_developer'], $permissions, $developerPermissions);
        $this->assignPermissionsToRole($roles['verification_officer'], $permissions, $verificationOfficerPermissions);
        $this->assignPermissionsToRole($roles['itdb_auditor'], $permissions, $itdbAuditorPermissions);
        $this->assignPermissionsToRole($roles['governance_committee'], $permissions, $governanceCommitteePermissions);
        $this->assignPermissionsToRole($roles['review_committee'], $permissions, $reviewCommitteePermissions);
        $this->assignPermissionsToRole($roles['security_officer'], $permissions, $securityOfficerPermissions);
        $this->assignPermissionsToRole($roles['risk_officer'], $permissions, $riskOfficerPermissions);
        $this->assignPermissionsToRole($roles['compliance_officer'], $permissions, $complianceOfficerPermissions);
        $this->assignPermissionsToRole($roles['legal_officer'], $permissions, $legalOfficerPermissions);
        $this->assignPermissionsToRole($roles['institutional_user'], $permissions, $institutionalUserPermissions);
        $this->assignPermissionsToRole($roles['vendor'], $permissions, $vendorPermissions);
        
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
