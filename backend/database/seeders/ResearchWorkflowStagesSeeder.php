<?php

namespace Database\Seeders;

use App\Models\ResearchWorkflowStage;
use Illuminate\Database\Seeder;

/**
 * Technology Evaluation Workflow Stages Seeder
 * 
 * Stages are conditional based on applies_to:
 *   - "all"            : appears for all request types
 *   - "system"         : only for System Requests (new dev, transfer, upgrade)
 *   - "infrastructure" : only for Infrastructure Requests (cloud, server, network, etc.)
 */
class ResearchWorkflowStagesSeeder extends Seeder
{
    public function run(): void
    {
        $stages = [ 

            // ─── STAGE 1: System Technical Assessment (CONDITIONAL: System only) ─────
            [
                "name"              => "Technical Assessment",
                "slug"              => "system_technical_assessment",
                "description"       => "Assess the business requirement, existing system, proposed solution, or technical capabilities current infrastructure, requirements, compatibility, and operational environment",
                "order"             => 1,
                "is_required"       => true,
                "requires_approval" => true,  
                "is_active"         => true,
                "research_type"     => "all",
                "form_fields"       => [
                    ["name" => "note",    "label" => "Note",          "type" => "textarea", "required" => true], 
                    [ "name" => "assessment_document", "label" => "Assessment Document", "type" => "file", "required" => true ],
                    [ "name" => "assessment_decision", "label" => "Assessment Decision", "type" => "select", "required" => true,
                        "options" => [
                            [
                                "value" => "acceptable",
                                "label" => "Acceptable"
                            ],
                            [
                                "value" => "needs_improvement",
                                "label" => "Needs Improvement"
                            ],
                            [
                                "value" => "unacceptable",
                                "label" => "Unacceptable"
                            ], 
                        ]
                    ],
                ],
            ],
            

            // ─── STAGE 2: Feasibility Assessment ─────────────────────────────────────
            [
                "name"              => "Feasibility Assessment",
                "slug"              => "feasibility_assessment",
                "description"       => "Evaluate whether the proposed system or infrastructure request is feasible from technical, operational, financial, and strategic perspectives",
                "order"             => 2,
                "is_required"       => true,
                "requires_approval" => true,  
                "is_active"         => true,

                "form_fields"       => [
                    ["name" => "note",    "label" => "Note",          "type" => "textarea", "required" => true],
                    ["name" => "feasibility_document", "label" => "Feasibility Document", "type" => "file", "required" => true],
                    [
                        "name" => "feasibility_decision",
                        "label" => "Feasibility Decision",
                        "type" => "select",
                        "required" => true,
                        "options" => [
                            [
                                "value" => "feasible",
                                "label" => "Feasible"
                            ],
                            [
                                "value" => "needs_improvement",
                                "label" => "Needs Improvement"
                            ],
                            [
                                "value" => "not_feasible",
                                "label" => "Not Feasible"
                            ],
                        ]
                    ],

                    
                ],
            ],


            // ─── STAGE 3: Duplicate Assessment ─────────────────────────────────────
            [
                "name"              => "Duplicate Assessment",
                "slug"              => "duplicate_assessment",
                "description"       => "Evaluate whether the proposed system is a duplicate of an existing solution",
                "order"             => 3,
                "is_required"       => true,
                "requires_approval" => true,
                "is_active"         => true,
                'research_type'     => "system_request",

                "form_fields"       => [
                    ["name" => "note",    "label" => "Note",          "type" => "textarea", "required" => true],
                    ["name" => "duplicate_assessment_document", "label" => "Duplicate Assessment Document", "type" => "file", "required" => true],
                    [
                        "name" => "duplicate_assessment_decision",
                        "label" => "Duplicate Assessment Decision",
                        "type" => "select",
                        "required" => true,
                        "options" => [
                            [
                                "value" => "new",
                                "label" => "New"
                            ],
                            [
                                "value" => "existing",
                                "label" => "Existing"
                            ],
                            [
                                "value" => "customization",
                                "label" => "Customization"
                            ],
                            [
                                "value" => "upgrade",
                                "label" => "Upgrade"
                            ], 
                        ]
                    ],


                ],
            ],

            // ─── STAGE 1: Security & Risk Assessment ─────────────────────────────────
            [
                "name"              => "Security & Risk Assessment",
                "slug"              => "security_risk_assessment",
                "description"       => "Evaluate security posture, compliance requirements, and risks associated with implementation",
                "order"             => 4,
                "is_required"       => true,
                "requires_approval" => true,  
                'research_type'     => "security_related_request",
                "is_active"         => true,
                "form_fields"       => [
                    ["name" => "note",    "label" => "Note",          "type" => "textarea", "required" => true],
                    ["name" => "security_assessment_document", "label" => "Security Assessment Document", "type" => "file", "required" => true],
                    [
                        "name" => "security_assessment_decision",
                        "label" => "Security Assessment Decision",
                        "type" => "select",
                        "required" => true,
                        "options" => [
                            [
                                "value" => "low",
                                "label" => "Low"
                            ],
                            [
                                "value" => "medium",
                                "label" => "Medium"
                            ],
                            [
                                "value" => "high",
                                "label" => "High"
                            ],
                            [
                                "value" => "critical",
                                "label" => "Critical"
                            ],
                            [
                                "value" => "no_risks",
                                "label" => "No Risks Identified"
                            ]
                        ]
                    ],
                ]
            ],
  
            // ─── STAGE 7: Evaluation Summary Report ──────────────────────────────────
            [
                "name"              => "Evaluation Summary Report",
                "slug"              => "evaluation_summary_report",
                "description"       => "Prepare comprehensive evaluation report with findings, conclusions, and recommendation",
                "order"             => 6,
                "is_required"       => true,
                "requires_approval" => true,  
                "research_type"     => "all",
                "is_active"         => true,
                "form_fields"       => [
                    ["name" => "note",    "label" => "Note",          "type" => "textarea", "required" => true],
                    ["name" => "final_document", "label" => "Final Document", "type" => "file", "required" => true],
                    [
                        "name" => "decision",
                        "label" => "Decision",
                        "type" => "select",
                        "required" => true,
                        "options" => [
                            [
                                "value" => "approved_to_develop",
                                "label" => "Approved for Development"
                            ],
                            [
                                "value" => "transfer_existing",
                                "label" => "Approve Transfer Existing system/solution"
                            ],
                            [
                                "value" => "customization_of_existing",
                                "label" => "Approve Customization of Existing Project"
                            ],
                            [
                                "value" => "infrastructure_upgrade",
                                "label" => "Approve Infrastructure Upgrade"
                            ],
                            [
                                "value" => "rejected",
                                "label" => "Rejected"
                            ],
                            [
                                "value" => "needs_improvement",
                                "label" => "Needs Improvement"
                            ],
                            [
                                "value" => "deferred",
                                "label" => "Deferred"
                            ],
                            [
                                "value" => "pending",
                                "label" => "Pending"
                            ],
                            [
                                "value" => "further_review_required",
                                "label" => "Further Review Required"
                            ],
                            [
                                "value" => "resubmit_with_changes",
                                "label" => "Resubmit with Changes"
                            ],
                            [
                                "value" => "approved_with_conditions",
                                "label" => "Approved with Conditions"
                            ],
                            [
                                "value" => "approved_for_pilot",
                                "label" => "Approved for Pilot Implementation"
                            ],
                            [
                                "value" => "approved_for_full_implementation",
                                "label" => "Approved for Full Implementation"
                            ],
                            [
                                "value" => "approved_for_production",
                                "label" => "Approved for Production Deployment"
                            ],
                            [
                                "value" => "no_risks",
                                "label" => "No Risks Identified"
                            ]
                        ]
                    ],
                ]
            ],
        ];

        // Delete old academic stages and insert new evaluation stages
        $oldSlugs = [
            "research_planning", "literature_review", "current_state_analysis",
            "technology_investigation", "proof_of_concept", "findings_recommendations", "final_report",
        ];
        ResearchWorkflowStage::whereIn("slug", $oldSlugs)->delete();

        foreach ($stages as $stage) {
            ResearchWorkflowStage::updateOrCreate(
                ["slug" => $stage["slug"]],
                $stage
            );
        }

        $this->command->info("Technology Evaluation workflow stages seeded successfully!");
    }
}
