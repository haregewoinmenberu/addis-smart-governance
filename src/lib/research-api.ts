import type { ResearchIdeaFormData, ResearchScreeningFormData, ResearchProjectFormData } from "./research-schema";

const API_BASE_URL = '/api';

class ResearchAPI {
  private getHeaders() {
    const token = localStorage.getItem('token');
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

  // Research Ideas
  async getIdeas(params?: { search?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    
    const response = await fetch(`${API_BASE_URL}/research-ideas?${query}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getIdea(id: string) {
    const response = await fetch(`${API_BASE_URL}/research-ideas/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createIdea(data: ResearchIdeaFormData) {
    const response = await fetch(`${API_BASE_URL}/research-ideas`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async updateIdea(id: string, data: ResearchIdeaFormData) {
    const response = await fetch(`${API_BASE_URL}/research-ideas/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deleteIdea(id: string) {
    const response = await fetch(`${API_BASE_URL}/research-ideas/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Research Screenings
  async getScreenings(params?: { search?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    
    const response = await fetch(`${API_BASE_URL}/research-screenings?${query}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getScreening(id: string) {
    const response = await fetch(`${API_BASE_URL}/research-screenings/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createScreening(data: ResearchScreeningFormData & { research_idea_id: string }) {
    const response = await fetch(`${API_BASE_URL}/research-screenings`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  // Research Projects
  async getProjects(params?: { search?: string; current_stage?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.current_stage) query.append('current_stage', params.current_stage);
    
    const response = await fetch(`${API_BASE_URL}/research-projects?${query}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getProject(id: string) {
    const response = await fetch(`${API_BASE_URL}/research-projects/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createProject(data: ResearchProjectFormData & { research_idea_id?: string }) {
    const response = await fetch(`${API_BASE_URL}/research-projects`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async updateProject(id: string, data: Partial<ResearchProjectFormData>) {
    const response = await fetch(`${API_BASE_URL}/research-projects/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getDashboard() {
    const response = await fetch(`${API_BASE_URL}/research-projects/dashboard`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getMyDashboard() {
    const response = await fetch(`${API_BASE_URL}/research-projects/my-dashboard`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Research Evaluations
  async getEvaluations(params?: { search?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    
    const response = await fetch(`${API_BASE_URL}/research-evaluations?${query}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getEvaluation(id: string) {
    const response = await fetch(`${API_BASE_URL}/research-evaluations/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createEvaluation(data: any) {
    const response = await fetch(`${API_BASE_URL}/research-evaluations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  // Technology Transfers
  async getTransfers(params?: { search?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    
    const response = await fetch(`${API_BASE_URL}/technology-transfers?${query}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getTransfer(id: string) {
    const response = await fetch(`${API_BASE_URL}/technology-transfers/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createTransfer(data: any) {
    const response = await fetch(`${API_BASE_URL}/technology-transfers`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async updateTransfer(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/technology-transfers/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  // Workflow Actions
  async transitionStage(projectId: string, data: { to_stage: string; comments?: string }) {
    const response = await fetch(`${API_BASE_URL}/research-projects/${projectId}/transition`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  // Reports and Analytics
  async getReportStats() {
    const response = await fetch(`${API_BASE_URL}/research-projects/reports/stats`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }
}

export const researchAPI = new ResearchAPI();
