export interface ResearchWorkflowStage {
  id: number;
  name: string;
  slug: string;
  description?: string;
  order: number;
  is_required: boolean;
  requires_approval: boolean;
  research_type?: 'all' | 'system_request' | 'infrastructure_request' | 'security_related_request';
  fillable_by_role?: 'research_director' | 'research_team_leader' | 'research_officer' | null;
  form_fields?: FormField[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'file';
  required: boolean;
  hint?: string;
  options?: Array<{ value: string; label: string }>;
}

export interface UploadedStageFile {
  path: string;
  original_name: string;
  size: number;
  mime: string;
}

export interface ResearchWorkflowProgress {
  id: number;
  research_idea_id: number;
  stage_id: number;
  status: 'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'revision_requested' | 'completed' | 'rejected';
  stage_data?: Record<string, any>;
  notes?: string;
  assigned_to?: number;
  started_at?: string;
  submitted_at?: string;
  completed_at?: string;
  completed_by?: number;
  created_at: string;
  updated_at: string;
  stage?: ResearchWorkflowStage;
  assigned_user?: User;
  completed_by_user?: User;
  reviews?: ResearchStageReview[];
}

export interface ResearchStageReview {
  id: number;
  workflow_progress_id: number;
  reviewed_by: number;
  decision: 'approved' | 'rejected' | 'revision_requested';
  review_comments: string;
  review_data?: Record<string, any>;
  reviewed_at: string;
  created_at: string;
  updated_at: string;
  reviewer?: User;
}

export interface ResearchAssignment {
  id: number;
  research_idea_id: number;
  assigned_by: number | User;
  assigned_to: number | User;
  assignment_type: 'team_leader' | 'officer' | 'reviewer';
  assignment_notes?: string;
  assigned_date: string;
  accepted_date?: string;
  completed_date?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ResearchForwardRequest {
  id: number;
  research_idea_id: number;
  forwarded_by: number;
  forwarded_to?: number;
  forward_message: string;
  attachments?: ForwardAttachment[];
  recommendations?: Recommendation[];
  forwarded_at: string;
  acknowledged_at?: string;
  acknowledged_by?: number;
  status: 'pending' | 'acknowledged' | 'under_review' | 'accepted' | 'implemented';
  smart_city_feedback?: string;
  created_at: string;
  updated_at: string;
  research_idea?: any;
  forwarded_by_user?: User;
  forwarded_to_user?: User;
  acknowledged_by_user?: User;
}

export interface ForwardAttachment {
  filename: string;
  path: string;
  size: number;
  type: string;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface User {
  id: number;
  name: string;
  email: string;
  department?: string;
  roles?: Role[];
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
}
