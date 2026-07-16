<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WorkflowDefinition;

class WorkflowDefinitionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $workflows = [
            [
                'name' => 'Technology Request Approval',
                'code' => 'tech_request_approval',
                'description' => 'Standard workflow for technology procurement requests',
                'entity_type' => 'request_item',
                'is_active' => true,
                'stages' => [
                    [
                        'name' => 'submission',
                        'display_name' => 'Request Submission',
                        'description' => 'User submits request',
                        'order' => 1,
                        'required_role' => null,
                        'actions' => ['submit', 'save_draft'],
                        'auto_advance' => true,
                    ],
                    [
                        'name' => 'validation',
                        'display_name' => 'Initial Validation',
                        'description' => 'System validates required fields and checks duplicates',
                        'order' => 2,
                        'required_role' => null,
                        'actions' => ['validate'],
                        'auto_advance' => true,
                    ],
                    [
                        'name' => 'duplication_analysis',
                        'display_name' => 'Duplication Analysis',
                        'description' => 'Check for existing similar technologies',
                        'order' => 3,
                        'required_role' => 'itdb_administrator',
                        'actions' => ['analyze', 'skip'],
                        'auto_advance' => false,
                    ],
                    [
                        'name' => 'feasibility_evaluation',
                        'display_name' => 'Feasibility Evaluation',
                        'description' => 'Technical, financial, and security assessment',
                        'order' => 4,
                        'required_role' => 'itdb_auditor',
                        'actions' => ['evaluate', 'request_revision'],
                        'auto_advance' => false,
                    ],
                    [
                        'name' => 'auditor_review',
                        'display_name' => 'Auditor Review',
                        'description' => 'Compliance and risk assessment',
                        'order' => 5,
                        'required_role' => 'itdb_auditor',
                        'actions' => ['approve', 'reject', 'request_revision'],
                        'auto_advance' => false,
                    ],
                    [
                        'name' => 'itdb_approval',
                        'display_name' => 'ITDB Administrator Approval',
                        'description' => 'Final approval decision',
                        'order' => 6,
                        'required_role' => 'itdb_administrator',
                        'actions' => ['approve', 'reject', 'request_revision'],
                        'auto_advance' => false,
                    ],
                    [
                        'name' => 'deployment_monitoring',
                        'display_name' => 'Deployment Monitoring',
                        'description' => 'Track implementation progress',
                        'order' => 7,
                        'required_role' => 'itdb_administrator',
                        'actions' => ['update_progress', 'complete'],
                        'auto_advance' => false,
                    ],
                    [
                        'name' => 'audit_compliance',
                        'display_name' => 'Audit & Compliance Monitoring',
                        'description' => 'Post-deployment audit',
                        'order' => 8,
                        'required_role' => 'itdb_auditor',
                        'actions' => ['audit', 'close'],
                        'auto_advance' => false,
                    ],
                ],
            ],
            [
                'name' => 'Vendor Approval Workflow',
                'code' => 'vendor_approval',
                'description' => 'Workflow for vendor registration and approval',
                'entity_type' => 'vendor',
                'is_active' => true,
                'stages' => [
                    [
                        'name' => 'registration',
                        'display_name' => 'Vendor Registration',
                        'description' => 'Vendor submits registration',
                        'order' => 1,
                        'required_role' => null,
                        'actions' => ['submit'],
                        'auto_advance' => true,
                    ],
                    [
                        'name' => 'document_verification',
                        'display_name' => 'Document Verification',
                        'description' => 'Verify vendor documents',
                        'order' => 2,
                        'required_role' => 'itdb_administrator',
                        'actions' => ['verify', 'reject'],
                        'auto_advance' => false,
                    ],
                    [
                        'name' => 'compliance_check',
                        'display_name' => 'Compliance Check',
                        'description' => 'Auditor reviews compliance',
                        'order' => 3,
                        'required_role' => 'itdb_auditor',
                        'actions' => ['approve', 'reject'],
                        'auto_advance' => false,
                    ],
                    [
                        'name' => 'final_approval',
                        'display_name' => 'Final Approval',
                        'description' => 'ITDB Administrator final approval',
                        'order' => 4,
                        'required_role' => 'itdb_administrator',
                        'actions' => ['approve', 'reject'],
                        'auto_advance' => false,
                    ],
                ],
            ],
        ];

        foreach ($workflows as $workflow) {
            WorkflowDefinition::updateOrCreate(
                ['code' => $workflow['code']],
                $workflow
            );
        }

        $this->command->info('Workflow definitions seeded successfully!');
    }
}
