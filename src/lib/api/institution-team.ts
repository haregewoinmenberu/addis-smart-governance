import { apiGet, apiPost } from "@/lib/api";

export interface TeamMember {
  id: number;
  institution_id: number;
  user_id: number | null;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'viewer' | 'collaborator';
  role_label: string;
  status: 'active' | 'invited' | 'suspended';
  status_label: string;
  invited_at: string | null;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
  permissions: string[];
}

export interface TeamStatistics {
  total_members: number;
  active_members: number;
  invited_members: number;
  by_role: Record<string, number>;
}

export interface GetTeamParams {
  status?: string;
  role?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface InviteTeamMemberParams {
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'viewer' | 'collaborator';
}

export interface UpdateTeamMemberParams {
  role?: 'admin' | 'manager' | 'viewer' | 'collaborator';
  status?: 'active' | 'invited' | 'suspended';
}

/**
 * Get all team members for an institution
 */
export async function getTeamMembers(
  institutionId: number,
  params?: GetTeamParams
) {
  return apiGet<{ success: boolean; data: { data: TeamMember[] } }>(
    `/institutions/${institutionId}/team`,
    params
  );
}

/**
 * Invite a new team member
 */
export async function inviteTeamMember(
  institutionId: number,
  params: InviteTeamMemberParams
) {
  return apiPost<{ success: boolean; data: TeamMember; message: string }>(
    `/institutions/${institutionId}/team`,
    params
  );
}

/**
 * Get a single team member
 */
export async function getTeamMember(institutionId: number, memberId: number) {
  return apiGet<{ success: boolean; data: TeamMember }>(
    `/institutions/${institutionId}/team/${memberId}`
  );
}

/**
 * Update team member
 */
export async function updateTeamMember(
  institutionId: number,
  memberId: number,
  params: UpdateTeamMemberParams
) {
  return apiPost<{ success: boolean; data: TeamMember; message: string }>(
    `/institutions/${institutionId}/team/${memberId}/update`,
    params
  );
}

/**
 * Remove team member
 */
export async function removeTeamMember(institutionId: number, memberId: number) {
  return apiPost<{ success: boolean; message: string }>(
    `/institutions/${institutionId}/team/${memberId}/delete`,
    {}
  );
}

/**
 * Resend invitation
 */
export async function resendInvitation(institutionId: number, memberId: number) {
  return apiPost<{ success: boolean; message: string }>(
    `/institutions/${institutionId}/team/${memberId}/resend-invitation`,
    {}
  );
}

/**
 * Accept invitation
 */
export async function acceptInvitation(token: string) {
  return apiPost<{ success: boolean; data: TeamMember; message: string }>(
    '/team/accept-invitation',
    { token }
  );
}

/**
 * Get team statistics
 */
export async function getTeamStatistics(institutionId: number) {
  return apiGet<{ success: boolean; data: TeamStatistics }>(
    `/institutions/${institutionId}/team/statistics`
  );
}
