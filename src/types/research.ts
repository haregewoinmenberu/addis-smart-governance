export enum IdeaStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ResearchCategory {
  // System Requests
  SYSTEM_NEW = 'system_new',
  SYSTEM_TRANSFER = 'system_transfer',
  SYSTEM_UPGRADE = 'system_upgrade',

  // Infrastructure Requests
  INFRASTRUCTURE_CLOUD = 'infrastructure_cloud',
  INFRASTRUCTURE_SERVER = 'infrastructure_server',
  INFRASTRUCTURE_NETWORK = 'infrastructure_network',
  INFRASTRUCTURE_STORAGE = 'infrastructure_storage',
  INFRASTRUCTURE_SECURITY = 'infrastructure_security',
  INFRASTRUCTURE_DATA_CENTER = 'infrastructure_data_center',

  // Legacy fallback
  BASIC_RESEARCH = 'basic_research',
  APPLIED_RESEARCH = 'applied_research',
  EXPERIMENTAL_DEVELOPMENT = 'experimental_development',
  INNOVATION = 'innovation',
  PILOT_PROJECT = 'pilot_project',
}

export enum ResearchStage {
  IDEA_IDENTIFICATION = 'idea_identification',
  SCREENING = 'screening',
  PROPOSAL_DEVELOPMENT = 'proposal_development',
  APPROVAL = 'approval',
  EXECUTION = 'execution',
  EVALUATION = 'evaluation',
  TECHNOLOGY_TRANSFER = 'technology_transfer',
}

export enum ApprovalDecision {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVISION_REQUESTED = 'revision_requested',
  PENDING = 'pending',
}

export enum TRLLevel {
  BASIC_PRINCIPLES = 1,
  TECHNOLOGY_CONCEPT = 2,
  EXPERIMENTAL_PROOF = 3,
  LAB_VALIDATION = 4,
  RELEVANT_ENVIRONMENT = 5,
  PROTOTYPE_DEMONSTRATION = 6,
  OPERATIONAL_ENVIRONMENT = 7,
  SYSTEM_COMPLETED = 8,
  TECHNOLOGY_DEPLOYED = 9,
}

export interface ResearchIdea {
  id: number;
  title: string;
  summary: string;
  problem_statement: string;
  objectives: string;
  expected_outcome: string;
  research_category: ResearchCategory;
  government_sector?: string;
  priority: Priority;
  status: IdeaStatus;
  submitted_by: number;
  sub_city_id?: number;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  submitter?: User;
  sub_city?: SubCity;
  attachments?: ResearchIdeaAttachment[];
  screenings?: ResearchScreening[];
}

export interface ResearchIdeaAttachment {
  id: number;
  research_idea_id: number;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  uploaded_by: number;
  created_at: string;
}

export interface ResearchScreening {
  id: number;
  research_idea_id: number;
  evaluated_by: number;
  strategic_alignment_score: number;
  strategic_alignment_comment?: string;
  feasibility_score: number;
  feasibility_comment?: string;
  governance_impact_score: number;
  governance_impact_comment?: string;
  resource_requirement_score: number;
  resource_requirement_comment?: string;
  innovation_level_score: number;
  innovation_level_comment?: string;
  risk_level_score: number;
  risk_level_comment?: string;
  total_score: number;
  calculated_priority: Priority;
  decision: ApprovalDecision;
  overall_comment?: string;
  created_at: string;
  evaluator?: User;
  research_idea?: ResearchIdea;
}

export interface ResearchProject {
  id: number;
  project_code: string;
  research_idea_id: number;
  title: string;
  current_stage: ResearchStage;
  background?: string;
  objectives?: string;
  methodology?: string;
  expected_deliverables?: string;
  estimated_budget?: number;
  required_resources?: string;
  start_date?: string;
  end_date?: string;
  risk_analysis?: string;
  success_metrics?: string;
  progress_percentage: number;
  project_lead_id?: number;
  sub_city_id?: number;
  trl_level: number;
  created_at: string;
  updated_at: string;
  research_idea?: ResearchIdea;
  project_lead?: User;
  sub_city?: SubCity;
  milestones?: ResearchMilestone[];
  tasks?: ResearchTask[];
  team_members?: ResearchTeamMember[];
  workflow_history?: ResearchWorkflowHistory[];
}

export interface ResearchMilestone {
  id: number;
  research_project_id: number;
  title: string;
  description?: string;
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
  progress_percentage: number;
  status: string;
  deliverables?: string;
  assigned_to?: number;
  order: number;
  assignee?: User;
}

export interface ResearchTask {
  id: number;
  research_project_id: number;
  research_milestone_id?: number;
  title: string;
  description?: string;
  priority: Priority;
  status: string;
  due_date?: string;
  completed_at?: string;
  assigned_to?: number;
  estimated_hours?: number;
  actual_hours?: number;
  assignee?: User;
}

export interface ResearchWorkflowHistory {
  id: number;
  research_project_id: number;
  from_stage: ResearchStage;
  to_stage: ResearchStage;
  transition_reason?: string;
  transitioned_by: number;
  transitioned_at: string;
  transitioner?: User;
}

export interface ResearchTeamMember {
  id: number;
  research_project_id: number;
  user_id: number;
  role: string;
  responsibilities?: string;
  joined_date: string;
  left_date?: string;
  is_active: boolean;
  user?: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface SubCity {
  id: number;
  name: string;
}
