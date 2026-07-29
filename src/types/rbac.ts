// Role-Based Access Control Types

export type RoleName =
  | 'itdb_administrator'
  | 'itdb_auditor'
  | 'bureau_head'
  | 'smart_city_sector_head'
  | 'capacity_building_director'
  | 'training_team_leader'
  | 'training_officer'
  | 'research_director'
  | 'research_team_leader'
  | 'research_officer'
  | 'security_director'
  | 'security_officer'
  | 'development_sector_head'
  | 'project_director'
  | 'project_manager'
  | 'software_development_director'
  | 'software_team_leader'
  | 'software_developer'
  | 'infrastructure_director'
  | 'infrastructure_engineer'
  | 'operation_sector_head'
  | 'maintenance_director'
  | 'maintenance_team_leader'
  | 'support_officer'
  | 'data_center_director'
  | 'cloud_engineer'
  | 'quality_director'
  | 'quality_officer';

export type PermissionName =
  // Dashboard
  | 'view_dashboard'
  | 'view_executive_dashboard'
  | 'view_reports_dashboard'
  | 'view_auditor_dashboard'
  | 'view_institution_dashboard'
  | 'view_research_dashboard'
  | 'view_licensing_dashboard'
  | 'view_technology_transfer_dashboard'
  | 'view_subcity_dashboard'
  // User Management
  | 'view_users'
  | 'create_users'
  | 'edit_users'
  | 'delete_users'
  | 'manage_roles'
  | 'assign_roles'
  // Request Management
  | 'view_requests'
  | 'create_requests'
  | 'edit_requests'
  | 'delete_requests'
  | 'receive_requests'
  | 'assign_requests'
  | 'reassign_requests'
  | 'approve_requests'
  | 'reject_requests'
  | 'return_requests'
  | 'change_request_priority'
  | 'close_requests'
  | 'view_all_requests'
  // Training Management
  | 'view_training'
  | 'create_training'
  | 'edit_training'
  | 'assign_training_officer'
  | 'schedule_training'
  | 'approve_training'
  | 'cancel_training'
  | 'upload_training_material'
  | 'upload_attendance'
  | 'generate_certificate'
  | 'complete_training'
  // Research
  | 'view_research'
  | 'create_research'
  | 'manage_research'
  | 'assign_research'
  | 'conduct_research'
  | 'approve_research'
  | 'technology_assessment'
  | 'cost_benefit_analysis'
  | 'risk_analysis'
  | 'submit_feasibility'
  | 'approve_feasibility'
  | 'forward_project'
  | 'assess_technology'
  | 'view_all_research'
  | 'assign_team_leader'
  | 'assign_officer'
  | 'manage_research_workflow'
  | 'view_assigned_research'
  | 'update_research_progress'
  | 'submit_research_stage'
  | 'review_research_stage'
  | 'approve_research_stage'
  // Research Officer specific
  | 'view_assigned_task'
  | 'update_assessment'
  | 'upload_documents'
  | 'submit_assessment'
  // Research (kebab-case for compatibility)
  | 'view_research'
  | 'create_research_ideas'
  | 'edit_research_ideas'
  | 'delete_research_ideas'
  | 'submit_research_ideas'
  | 'view-research-screenings'
  | 'create-research-screenings'
  | 'edit-research-screenings'
  | 'approve-research-screenings'
  | 'view-research-projects'
  | 'create-research-projects'
  | 'edit-research-projects'
  | 'delete-research-projects'
  | 'manage-research-projects'
  | 'transition-research-stages'
  | 'rollback-research-stages'
  | 'view-proposals'
  | 'create-proposals'
  | 'edit-proposals'
  | 'review-proposals'
  | 'approve-proposals'
  | 'manage-milestones'
  | 'manage-tasks'
  | 'manage-experiments'
  | 'manage-prototypes'
  | 'submit-progress-reports'
  | 'evaluate-research'
  | 'assess-trl'
  | 'manage-technology-transfer'
  | 'approve-technology-transfer'
  | 'view-research-reports'
  | 'view-research-analytics'
  // Security Management
  | 'view_security_review'
  | 'assign_security_review'
  | 'security_assessment'
  | 'vulnerability_assessment'
  | 'penetration_testing'
  | 'approve_security'
  | 'reject_security'
  | 'issue_security_clearance'
  // Project Management
  | 'view_projects'
  | 'create_project'
  | 'edit_project'
  | 'assign_project'
  | 'assign_project_manager'
  | 'update_project_timeline'
  | 'approve_milestone'
  | 'approve_deliverable'
  | 'close_project'
  | 'archive_project'
  // Task Management
  | 'create_tasks'
  | 'assign_tasks'
  | 'update_task_status'
  | 'submit_task'
  | 'review_task'
  // Software Development
  | 'assign_developer'
  | 'review_architecture'
  | 'review_code'
  | 'commit_code'
  | 'review_pull_request'
  | 'approve_merge'
  | 'approve_release'
  | 'upload_documentation'
  // Infrastructure
  | 'view_infrastructure'
  | 'approve_design'
  | 'network_configuration'
  | 'server_installation'
  | 'firewall_configuration'
  | 'upload_configuration'
  // IT Operations
  | 'view_tickets'
  | 'assign_ticket'
  | 'accept_ticket'
  | 'update_ticket'
  | 'resolve_ticket'
  | 'close_ticket'
  | 'approve_maintenance'
  // Cloud Management
  | 'approve_cloud_resource'
  | 'provision_server'
  | 'deploy_application'
  | 'backup_system'
  | 'restore_system'
  | 'scale_resource'
  // Quality & Compliance
  | 'view_quality_review'
  | 'conduct_quality_test'
  | 'audit_documents'
  | 'verify_compliance'
  | 'approve_quality'
  | 'reject_quality'
  | 'generate_audit_report'
  // Reports
  | 'view_reports'
  | 'create_reports'
  | 'generate_reports'
  | 'export_reports'
  | 'view_all_reports'
  // Technology Registry
  | 'view_technologies'
  | 'create_technologies'
  | 'edit_technologies'
  | 'delete_technologies'
  | 'view_all_technologies'
  // Audits
  | 'view_audits'
  | 'create_audits'
  | 'conduct_audits'
  | 'view_audit_reports'
  | 'respond_to_audits'
  // Workflows
  | 'view_workflows'
  | 'create_workflows'
  | 'edit_workflows'
  | 'delete_workflows'
  | 'configure_workflows'
  // Vendors
  | 'view_vendors'
  | 'create_vendors'
  | 'edit_vendors'
  | 'approve_vendors'
  // Cybersecurity
  | 'view_cybersecurity'
  | 'manage_cybersecurity'
  | 'review_security_incidents'
  // Settings
  | 'view_settings'
  | 'manage_settings'
  | 'archive_records'
  // Notifications
  | 'view_notifications'
  | 'send_notifications'
  | 'manage_notifications'
  // Surveys
  | 'view_surveys'
  | 'participate_surveys'
  | 'create_surveys'
  // Duplication
  | 'view_duplication'
  | 'view_duplications'
  | 'perform_duplication_analysis'
  // Feasibility
  | 'view_feasibility'
  | 'view_feasibility_studies'
  | 'conduct_feasibility'
  // General
  | 'manage_command_center'
  | 'classify_requests'
  | 'route_requests'
  | 'view_institutions'
  | 'verify_institutions'
  | 'view_technology_transfer';

export interface Role {
  id: number;
  name: RoleName;
  display_name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: PermissionName;
  display_name: string;
  module: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  sub_city?: string;
  department?: string;
  user_type?: 'INTERNAL' | 'INSTITUTIONAL' | 'EXTERNAL';
  institution_id?: number;
  institution?: {
    id: number;
    name: string;
  };
  is_active: boolean;
  mfa_enabled: boolean;
  last_login_at?: string;
  roles?: Role[];
  permissions?: PermissionName[];
  can_manage?: boolean;
  created_by?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token_type: string;
  access_token: string;
  expires_at: string;
  user: User;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  module: string;
  subject_type?: string;
  subject_id?: number;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface UserSession {
  id: number;
  user_id: number;
  token_id: string;
  ip_address?: string;
  user_agent?: string;
  last_activity_at: string;
  expires_at: string;
  created_at: string;
}

// Workflow Types

export type WorkflowStatus = 
  | 'draft'
  | 'pending'
  | 'in_progress'
  | 'approved'
  | 'rejected'
  | 'revision_requested';

export type WorkflowAction = 
  | 'submit'
  | 'save_draft'
  | 'validate'
  | 'analyze'
  | 'skip'
  | 'evaluate'
  | 'approve'
  | 'reject'
  | 'request_revision'
  | 'update_progress'
  | 'complete'
  | 'audit'
  | 'close';

export interface WorkflowStage {
  name: string;
  display_name: string;
  description: string;
  order: number;
  required_role?: RoleName;
  actions: WorkflowAction[];
  auto_advance: boolean;
}

export interface WorkflowDefinition {
  id: number;
  name: string;
  code: string;
  description?: string;
  entity_type: string;
  stages: WorkflowStage[];
  is_active: boolean;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowApproval {
  id: number;
  workflow_instance_id: number;
  stage_name: string;
  stage_index: number;
  approver_id?: number;
  approver?: User;
  action: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  comments?: string;
  metadata?: Record<string, unknown>;
  actioned_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowInstance {
  id: number;
  workflow_definition_id: number;
  definition?: WorkflowDefinition;
  workflowable_type: string;
  workflowable_id: number;
  workflowable?: unknown;
  current_stage: string;
  current_stage_index: number;
  status: WorkflowStatus;
  started_at?: string;
  completed_at?: string;
  approvals?: WorkflowApproval[];
  created_at: string;
  updated_at: string;
}

export interface WorkflowAnalytics {
  total_instances: number;
  pending: number;
  approved: number;
  rejected: number;
  avg_completion_hours: number;
  approval_rate: number;
}

// Request Types with Workflow

export interface TechnologyRequest {
  id: number;
  workflow_instance_id?: number;
  workflow_instance?: WorkflowInstance;
  submitted_by?: number;
  submitter?: User;
  code: string;
  title: string;
  category?: string;
  office: string;
  status: string;
  step: number;
  total_steps: number;
  budget?: number;
  submitted_at?: string;
  priority: string;
  description?: string;
  justification?: string;
  documents?: string[];
  approval_status: WorkflowStatus;
  created_at: string;
  updated_at: string;
}

export interface DuplicationCase {
  id: number;
  request_item_id?: number;
  existing_technology_id?: number;
  similarity_score?: number;
  recommendation?: 'reuse' | 'extend' | 'new';
  analysis_notes?: string;
  analyzed_by?: number;
  analyzer?: User;
  created_at: string;
  updated_at: string;
}

export interface FeasibilityStudy {
  id: number;
  request_item_id?: number;
  technical_score?: number;
  financial_score?: number;
  security_score?: number;
  infrastructure_score?: number;
  integration_score?: number;
  sustainability_score?: number;
  overall_risk_score?: number;
  recommendation?: string;
  evaluated_by?: number;
  evaluator?: User;
  evaluated_at?: string;
  created_at: string;
  updated_at: string;
}
