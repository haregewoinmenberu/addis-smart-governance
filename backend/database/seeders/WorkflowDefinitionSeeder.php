<?php

namespace Database\Seeders;

use App\Models\WorkflowDefinition;
use App\Models\User;
use Illuminate\Database\Seeder;

class WorkflowDefinitionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::whereHas('roles', function ($query) {
            $query->where('name', 'itdb_administrator');
        })->first();

        // Technology Request Approval Workflow
        WorkflowDefinition::create([
            'name' => 'Technology Request Approval',
            'code' => 'tech_request_approval',
            'description' => 'Multi-stage approval workflow for technology requests including duplication analysis and feasibility evaluation',
            'entity_type' => 'App\\Models\\RequestItem',
            'is_active' => true,
            'created_by' => $admin?->id,
            'stages' => [
                [
                    'order' => 1,
                    'name' => 'initial_review',
                    'display_name' => 'Initial Review',
                    'description' => 'Initial review of the request for completeness and basic requirements',
                    'required_role' => 'itdb_administrator',
                    'actions' => ['approve', 'reject', 'request_revision'],
                    'auto_advance' => false,
                ],
                [
                    'order' => 2,
                    'name' => 'duplication_analysis',
                    'display_name' => 'Duplication Analysis',
                    'description' => 'Analyze request against existing technologies to identify potential duplications',
                    'required_role' => 'duplication_analyst',
                    'actions' => ['approve', 'reject', 'request_revision'],
                    'auto_advance' => false,
                ],
                [
                    'order' => 3,
                    'name' => 'feasibility_study',
                    'display_name' => 'Feasibility Study',
                    'description' => 'Multi-criteria feasibility evaluation including technical, financial, security, infrastructure, integration, and sustainability assessment',
                    'required_role' => 'feasibility_evaluator',
                    'actions' => ['approve', 'reject', 'request_revision'],
                    'auto_advance' => false,
                ],
                [
                    'order' => 4,
                    'name' => 'budget_approval',
                    'display_name' => 'Budget Approval',
                    'description' => 'Review and approve budget allocation for the request',
                    'required_role' => 'budget_approver',
                    'actions' => ['approve', 'reject', 'request_revision'],
                    'auto_advance' => false,
                ],
                [
                    'order' => 5,
                    'name' => 'final_approval',
                    'display_name' => 'Final Approval',
                    'description' => 'Final approval by ITDB Administrator',
                    'required_role' => 'itdb_administrator',
                    'actions' => ['approve', 'reject'],
                    'auto_advance' => true,
                ],
            ],
        ]);

        // Vendor Approval Workflow
        WorkflowDefinition::create([
            'name' => 'Vendor Approval',
            'code' => 'vendor_approval',
            'description' => 'Approval workflow for new vendor registration',
            'entity_type' => 'App\\Models\\Vendor',
            'is_active' => true,
            'created_by' => $admin?->id,
            'stages' => [
                [
                    'order' => 1,
                    'name' => 'document_verification',
                    'display_name' => 'Document Verification',
                    'description' => 'Verify vendor documents and credentials',
                    'required_role' => 'itdb_administrator',
                    'actions' => ['approve', 'reject', 'request_revision'],
                    'auto_advance' => false,
                ],
                [
                    'order' => 2,
                    'name' => 'compliance_check',
                    'display_name' => 'Compliance Check',
                    'description' => 'Check vendor compliance with regulations and standards',
                    'required_role' => 'auditor',
                    'actions' => ['approve', 'reject'],
                    'auto_advance' => false,
                ],
                [
                    'order' => 3,
                    'name' => 'final_approval',
                    'display_name' => 'Final Approval',
                    'description' => 'Final approval for vendor registration',
                    'required_role' => 'itdb_administrator',
                    'actions' => ['approve', 'reject'],
                    'auto_advance' => true,
                ],
            ],
        ]);

        // Audit Workflow
        WorkflowDefinition::create([
            'name' => 'Audit Process',
            'code' => 'audit_process',
            'description' => 'Workflow for conducting audits',
            'entity_type' => 'App\\Models\\Audit',
            'is_active' => true,
            'created_by' => $admin?->id,
            'stages' => [
                [
                    'order' => 1,
                    'name' => 'planning',
                    'display_name' => 'Audit Planning',
                    'description' => 'Plan and schedule the audit',
                    'required_role' => 'auditor',
                    'actions' => ['approve'],
                    'auto_advance' => false,
                ],
                [
                    'order' => 2,
                    'name' => 'execution',
                    'display_name' => 'Audit Execution',
                    'description' => 'Conduct the audit',
                    'required_role' => 'auditor',
                    'actions' => ['approve'],
                    'auto_advance' => false,
                ],
                [
                    'order' => 3,
                    'name' => 'reporting',
                    'display_name' => 'Audit Reporting',
                    'description' => 'Prepare audit report',
                    'required_role' => 'auditor',
                    'actions' => ['approve'],
                    'auto_advance' => false,
                ],
                [
                    'order' => 4,
                    'name' => 'review',
                    'display_name' => 'Report Review',
                    'description' => 'Review and approve audit report',
                    'required_role' => 'itdb_administrator',
                    'actions' => ['approve', 'request_revision'],
                    'auto_advance' => true,
                ],
            ],
        ]);

        // Cybersecurity Issue Resolution Workflow
        WorkflowDefinition::create([
            'name' => 'Cybersecurity Issue Resolution',
            'code' => 'cybersecurity_resolution',
            'description' => 'Workflow for resolving cybersecurity issues',
            'entity_type' => 'App\\Models\\CybersecurityIssue',
            'is_active' => true,
            'created_by' => $admin?->id,
            'stages' => [
                [
                    'order' => 1,
                    'name' => 'triage',
                    'display_name' => 'Issue Triage',
                    'description' => 'Assess and prioritize the security issue',
                    'required_role' => 'itdb_administrator',
                    'actions' => ['approve'],
                    'auto_advance' => false,
                ],
                [
                    'order' => 2,
                    'name' => 'investigation',
                    'display_name' => 'Investigation',
                    'description' => 'Investigate the security issue',
                    'required_role' => 'itdb_administrator',
                    'actions' => ['approve'],
                    'auto_advance' => false,
                ],
                [
                    'order' => 3,
                    'name' => 'remediation',
                    'display_name' => 'Remediation',
                    'description' => 'Implement fixes and remediation measures',
                    'required_role' => 'itdb_administrator',
                    'actions' => ['approve'],
                    'auto_advance' => false,
                ],
                [
                    'order' => 4,
                    'name' => 'verification',
                    'display_name' => 'Verification',
                    'description' => 'Verify that the issue has been resolved',
                    'required_role' => 'auditor',
                    'actions' => ['approve', 'reject'],
                    'auto_advance' => true,
                ],
            ],
        ]);

        $this->command->info('Workflow definitions seeded successfully!');
    }
}
