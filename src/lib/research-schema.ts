import { z } from "zod";

// Research Idea form schema
export const researchIdeaSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  summary: z.string().min(50, "Summary must be at least 50 characters"),
  problem_statement: z.string().min(100, "Problem statement must be at least 100 characters"),
  objectives: z.string().min(50, "Objectives must be at least 50 characters"),
  expected_outcome: z.string().min(50, "Expected outcome must be at least 50 characters"),
  research_category: z.enum([
    "basic_research",
    "applied_research",
    "experimental_development",
    "innovation",
    "pilot_project"
  ], { errorMap: () => ({ message: "Please select a research category" }) }),
  government_sector: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
});

export type ResearchIdeaFormData = z.infer<typeof researchIdeaSchema>;

// Research Screening form schema
export const researchScreeningSchema = z.object({
  strategic_alignment_score: z.number().min(0).max(10),
  strategic_alignment_comment: z.string().optional(),
  feasibility_score: z.number().min(0).max(10),
  feasibility_comment: z.string().optional(),
  governance_impact_score: z.number().min(0).max(10),
  governance_impact_comment: z.string().optional(),
  resource_requirement_score: z.number().min(0).max(10),
  resource_requirement_comment: z.string().optional(),
  innovation_level_score: z.number().min(0).max(10),
  innovation_level_comment: z.string().optional(),
  risk_level_score: z.number().min(0).max(10),
  risk_level_comment: z.string().optional(),
  decision: z.enum(["approved", "rejected", "revision_requested"]),
  overall_comment: z.string().min(20, "Overall comment must be at least 20 characters"),
});

export type ResearchScreeningFormData = z.infer<typeof researchScreeningSchema>;

// Research Project form schema
export const researchProjectSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  background: z.string().min(100, "Background must be at least 100 characters"),
  objectives: z.string().min(50, "Objectives must be at least 50 characters"),
  methodology: z.string().min(100, "Methodology must be at least 100 characters"),
  expected_deliverables: z.string().min(50, "Expected deliverables must be at least 50 characters"),
  estimated_budget: z.number().min(0, "Budget must be a positive number"),
  required_resources: z.string().min(50, "Required resources must be at least 50 characters"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  risk_analysis: z.string().min(50, "Risk analysis must be at least 50 characters"),
  success_metrics: z.string().min(50, "Success metrics must be at least 50 characters"),
  project_lead_id: z.number().optional(),
});

export type ResearchProjectFormData = z.infer<typeof researchProjectSchema>;

// Category labels
export const researchCategoryLabels = {
  basic_research: "Basic Research",
  applied_research: "Applied Research",
  experimental_development: "Experimental Development",
  innovation: "Innovation",
  pilot_project: "Pilot Project",
};

// Priority labels
export const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

// Stage labels
export const stageLabels = {
  idea_identification: "Idea Identification",
  screening: "Screening & Prioritization",
  proposal_development: "Proposal Development",
  approval: "Approval",
  execution: "Execution",
  evaluation: "Evaluation",
  technology_transfer: "Technology Transfer",
};
