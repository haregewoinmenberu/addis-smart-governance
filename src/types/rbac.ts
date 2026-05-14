// Role-Based Access Control Types

export type RoleName = 'itdb_administrator' | 'sub_city_administrator' | 'auditor';

export type PermissionName =
  // User Management
  | 'view_users'
  | 'create_users'
  | 'edit_users'
  | 'delete_users'
  | 'assign_roles'
  // Technology Requests
  | 'view_requests'
  | 'create_requests'
  | 'edit_requests'
  | 'delete_requests'
  | 'approve_requests'
  | 'reject_requests'
  | 'view_all_requests'
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
  // Reports
  | 'view_reports'
  | 'create_reports'
  | 'export_reports'
  | 'view_all_reports'
  // Cybersecurity
  | 'view_cybersecurity'
  | 'manage_cybersecurity'
  | 'review_security_incidents'
  // Settings
  | 'view_settings'
  | 'manage_settings'
  // Dashboard
  | 'view_dashboard'
  | 'view_executive_dashboard'
  // Notifications
  | 'view_notifications'
  | 'manage_notifications'
  // Surveys
  | 'view_surveys'
  | 'participate_surveys'
  | 'create_surveys'
  // Duplication
  | 'view_duplication'
  | 'perform_duplication_analysis'
  // Feasibility
  | 'view_feasibility'
  | 'conduct_feasibility';

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
  sub_city?: string;
  department?: string;
  is_active: boolean;
  mfa_enabled: boolean;
  last_login_at?: string;
  roles: Role[];
  permissions: PermissionName[];
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
