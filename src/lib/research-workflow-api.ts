import { getAuthToken } from "./api";

const API_BASE_URL = '/api';

class ResearchWorkflowAPI {
  private getHeaders() {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  async getStages() {
    const response = await fetch(`${API_BASE_URL}/research-workflow/stages`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getProgress(ideaId: string) {
    const response = await fetch(`${API_BASE_URL}/research-workflow/ideas/${ideaId}/progress`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getProgressItem(progressId: string) {
    const response = await fetch(`${API_BASE_URL}/research-workflow/progress/${progressId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async initializeWorkflow(ideaId: string) {
    const response = await fetch(`${API_BASE_URL}/research-workflow/ideas/${ideaId}/initialize`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getAvailableTeamLeaders() {
    const response = await fetch(`${API_BASE_URL}/research-workflow/team-leaders`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getAvailableOfficers() {
    const response = await fetch(`${API_BASE_URL}/research-workflow/officers`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async assignTeamLeader(ideaId: string, data: { team_leader_id: number; assignment_notes?: string }) {
    const response = await fetch(`${API_BASE_URL}/research-workflow/ideas/${ideaId}/assign-team-leader`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async assignOfficer(ideaId: string, data: { officer_id: number; assignment_notes?: string }) {
    const response = await fetch(`${API_BASE_URL}/research-workflow/ideas/${ideaId}/assign-officer`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getAssignments(ideaId: string) {
    const response = await fetch(`${API_BASE_URL}/research-workflow/ideas/${ideaId}/assignments`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async startStage(progressId: string) {
    const response = await fetch(`${API_BASE_URL}/research-workflow/progress/${progressId}/start`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async submitStage(progressId: string, data: { stage_data: Record<string, any>; notes?: string }) {
    const response = await fetch(`${API_BASE_URL}/research-workflow/progress/${progressId}/submit`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async reviewStage(progressId: string, data: { decision: string; review_comments: string; review_data?: Record<string, any> }) {
    const response = await fetch(`${API_BASE_URL}/research-workflow/progress/${progressId}/review`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async acceptAssignment(assignmentId: string) {
    const response = await fetch(`${API_BASE_URL}/research-workflow/assignments/${assignmentId}/accept`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async startAssignment(assignmentId: string) {
    const response = await fetch(`${API_BASE_URL}/research-workflow/assignments/${assignmentId}/start`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async completeAssignment(assignmentId: string) {
    const response = await fetch(`${API_BASE_URL}/research-workflow/assignments/${assignmentId}/complete`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getForwardRequests(params?: { status?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    
    const response = await fetch(`${API_BASE_URL}/research-forward?${query}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async forwardToSmartCity(ideaId: string, formData: FormData) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/research-forward/ideas/${ideaId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  async getForwardRequest(id: string) {
    const response = await fetch(`${API_BASE_URL}/research-forward/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async acknowledgeForward(id: string, data: { feedback?: string }) {
    const response = await fetch(`${API_BASE_URL}/research-forward/${id}/acknowledge`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async updateForwardStatus(id: string, data: { status: string; feedback?: string }) {
    const response = await fetch(`${API_BASE_URL}/research-forward/${id}/status`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getTeamLeaderMembers() {
    const response = await fetch(`${API_BASE_URL}/research-team-leader/team-members`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // ── Research Officer endpoints ──────────────────────────────
  async getOfficerDashboard() {
    const response = await fetch(`${API_BASE_URL}/research-officer/dashboard`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getOfficerAssignments(status?: string) {
    const params = status ? `?status=${status}` : '';
    const response = await fetch(`${API_BASE_URL}/research-officer/my-assignments${params}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getOfficerStages(ideaId: string) {
    const response = await fetch(`${API_BASE_URL}/research-officer/ideas/${ideaId}/stages`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async acceptOfficerAssignment(assignmentId: string) {
    const response = await fetch(`${API_BASE_URL}/research-officer/assignments/${assignmentId}/accept`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getOfficerSubmissions() {
    const response = await fetch(`${API_BASE_URL}/research-officer/my-submissions`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }
}

export const researchWorkflowAPI = new ResearchWorkflowAPI();
