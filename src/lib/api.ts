type ApiOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const TOKEN_KEY = "strp_token";

/**
 * Error thrown by API calls. Carries the HTTP status so callers/boundaries can
 * distinguish 401 (not authenticated -> go to login) from 403 (authenticated
 * but forbidden -> do NOT redirect, the session is still valid).
 */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  // When sending FormData (file uploads) let the browser set the multipart
  // Content-Type (including the boundary) — never override it, or the upload
  // will be unparseable on the server.
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers: Record<string, string> = {
    "Accept": "application/json",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers ?? {}),
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body
      ? (isFormData ? (options.body as FormData) : JSON.stringify(options.body))
      : undefined,
    credentials: 'omit', // Don't send cookies to prevent session-based redirects
  });

  let payload: (T & { message?: string }) | undefined;
  try {
    payload = (await response.json()) as T & { message?: string };
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    // Only a genuine 401 (invalid/expired token) means the session is dead.
    // A 403 means the user IS authenticated but lacks permission for this
    // resource — we must NOT clear the token or bounce to /login for that,
    // otherwise routes the user can't access cause an infinite login loop.
    if (response.status === 401) {
      // Only clear token and redirect if this is NOT the /auth/me endpoint
      // The AuthContext will handle /auth/me failures
      if (!path.includes('/auth/me')) {
        clearAuthToken();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
    const message = payload?.message ?? "Request failed";
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export async function apiGet<T>(path: string) {
  return apiFetch<T>(path);
}

export async function apiPost<T>(path: string, body: unknown) {
  return apiFetch<T>(path, { method: "POST", body });
}

/**
 * POST multipart/form-data (file uploads). Pass a FormData instance; the
 * browser sets the Content-Type boundary automatically. For updates, use
 * Laravel method spoofing by appending `_method=PUT` to the FormData.
 */
export async function apiPostForm<T>(path: string, formData: FormData) {
  return apiFetch<T>(path, { method: "POST", body: formData });
}

/**
 * @deprecated Use apiPost with /update endpoint instead
 * Example: apiPost(`/users/${id}/update`, data)
 */
export async function apiPut<T>(path: string, body: unknown) {
  return apiFetch<T>(path, { method: "PUT", body });
}

/**
 * @deprecated Use apiPost with /delete endpoint instead
 * Example: apiPost(`/users/${id}/delete`, {})
 */
export async function apiDelete<T>(path: string) {
  return apiFetch<T>(path, { method: "DELETE" });
}

// Authentication
export async function login(email: string, password: string) {
  const data = await apiPost<{ access_token: string; user: unknown }>("/auth/login", { email, password });
  if (data.access_token) {
    setAuthToken(data.access_token);
  }
  return data;
}

export async function logout() {
  try {
    await apiPost("/auth/logout", {});
  } finally {
    clearAuthToken();
  }
}

// Dashboard
export interface DashboardStat {
  label: string;
  value: string | number;
  delta?: string;
  trend?: "up" | "down";
  accent?: "primary" | "info" | "warning" | "destructive" | "success";
}
export interface DashboardResponse {
  stats: DashboardStat[];
  investment: { m: string; v: number; c: number }[];
  subcity: { name: string; v: number }[];
  compliance: { name: string; v: number; c: string }[];
  insights: { t: string; b: string }[];
  approvals: { t: string; o: string; s: string; v: string }[];
  readiness: { l: string; v: number }[];
}

export async function getDashboard() {
  return apiGet<DashboardResponse>("/dashboard");
}

export async function getResearchProjectDashboard() {
  return apiGet<Record<string, unknown>>("/research-projects/dashboard");
}

export async function getResearcherDashboard() {
  return apiGet<Record<string, unknown>>("/research-projects/my-dashboard");
}

// Modules
export async function getModule(key: string) {
  return apiGet<{ data: { title: string; subtitle: string; points: string[] } }>(`/modules/${key}`);
}

// Generic list fetcher
export async function getList<T>(endpoint: string) {
  return apiGet<{ data: T[] }>(endpoint);
}

// Generic paginated list fetcher
export async function getPaginatedList<T>(endpoint: string, params?: Record<string, string>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : "";
  return apiGet<{
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  }>(`${endpoint}${queryString}`);
}

// Generic item fetcher
export async function getItem<T>(endpoint: string, id: string | number) {
  return apiGet<{ data: T }>(`${endpoint}/${id}`);
}

// Generic create
export async function createItem<T>(endpoint: string, data: unknown) {
  return apiPost<{ data: T; message: string }>(endpoint, data);
}

// Generic update
export async function updateItem<T>(endpoint: string, id: string | number, data: unknown) {
  return apiPost<{ data: T; message: string }>(`${endpoint}/${id}/update`, data);
}

// Generic delete
export async function deleteItem(endpoint: string, id: string | number) {
  return apiPost<{ message: string }>(`${endpoint}/${id}/delete`, {});
}

// Requests
export async function getRequests(params?: Record<string, string>) {
  return getPaginatedList("/requests", params);
}

export async function getRequest(id: string | number) {
  return getItem("/requests", id);
}

export async function createRequest(data: unknown) {
  return createItem("/requests", data);
}

export async function updateRequest(id: string | number, data: unknown) {
  return updateItem("/requests", id, data);
}

export async function deleteRequest(id: string | number) {
  return deleteItem("/requests", id);
}

export async function submitRequest(id: string | number) {
  return apiPost<{ data: unknown; message: string }>(`/requests/${id}/submit`, {});
}

export async function getRequestStatistics() {
  return apiGet<{ data: { total: number; draft: number; pending: number; approved: number; rejected: number; approval_rate: number } }>("/requests/statistics");
}

// Technologies
export async function getTechnologies(params?: Record<string, string>) {
  return getPaginatedList("/technologies", params);
}

export async function getTechnology(id: string | number) {
  return getItem("/technologies", id);
}

export async function createTechnology(data: unknown) {
  return createItem("/technologies", data);
}

export async function updateTechnology(id: string | number, data: unknown) {
  return updateItem("/technologies", id, data);
}

export async function deleteTechnology(id: string | number) {
  return deleteItem("/technologies", id);
}

export async function getTechnologyStatistics() {
  return apiGet<{ data: { total: number; active: number; inactive: number; pending: number; by_category: Array<{ category: string; count: number }> } }>("/technologies/statistics");
}

// Users
export async function getUsers(params?: Record<string, string>) {
  return getPaginatedList("/users", params);
}

export async function getUser(id: string | number) {
  return getItem("/users", id);
}

export async function createUser(data: unknown) {
  return createItem("/users", data);
}

export async function updateUser(id: string | number, data: unknown) {
  return updateItem("/users", id, data);
}

export async function deleteUser(id: string | number) {
  return deleteItem("/users", id);
}

export async function toggleUserActive(id: string | number) {
  return apiPost<{ data: unknown; message: string }>(`/users/${id}/toggle-active`, {});
}

export async function resetUserPassword(id: string | number, password: string) {
  return apiPost<{ message: string }>(`/users/${id}/reset-password`, { password, password_confirmation: password });
}

// Workflows
export async function getWorkflows() {
  return getList("/workflows");
}

export async function getWorkflow(id: string | number) {
  return getItem("/workflows", id);
}

export async function getWorkflowInstances(params?: Record<string, string>) {
  return getPaginatedList("/workflows/instances", params);
}

export async function getWorkflowInstance(id: string | number) {
  return getItem("/workflows/instances", id);
}

export async function approveWorkflowStage(id: string | number, data: { comments?: string; metadata?: Record<string, unknown> }) {
  return apiPost<{ data: unknown; message: string }>(`/workflows/instances/${id}/approve`, data);
}

export async function rejectWorkflow(id: string | number, data: { comments: string; metadata?: Record<string, unknown> }) {
  return apiPost<{ data: unknown; message: string }>(`/workflows/instances/${id}/reject`, data);
}

export async function requestWorkflowRevision(id: string | number, data: { comments: string; metadata?: Record<string, unknown> }) {
  return apiPost<{ data: unknown; message: string }>(`/workflows/instances/${id}/request-revision`, data);
}

// Audits
export async function getAudits(params?: Record<string, string>) {
  return getPaginatedList("/audits", params);
}

export async function getAudit(id: string | number) {
  return getItem("/audits", id);
}

export async function createAudit(data: unknown) {
  return createItem("/audits", data);
}

export async function updateAudit(id: string | number, data: unknown) {
  return updateItem("/audits", id, data);
}

export async function deleteAudit(id: string | number) {
  return deleteItem("/audits", id);
}

// Vendors
export async function getVendors(params?: Record<string, string>) {
  return getPaginatedList("/vendors", params);
}

export async function getVendor(id: string | number) {
  return getItem("/vendors", id);
}

export async function createVendor(data: unknown) {
  return createItem("/vendors", data);
}

export async function updateVendor(id: string | number, data: unknown) {
  return updateItem("/vendors", id, data);
}

export async function deleteVendor(id: string | number) {
  return deleteItem("/vendors", id);
}

export async function approveVendor(id: string | number) {
  return apiPost<{ data: unknown; message: string }>(`/vendors/${id}/approve`, {});
}

// Cybersecurity
export async function getCybersecurityIssues(params?: Record<string, string>) {
  return getPaginatedList("/cybersecurity", params);
}

export async function getCybersecurityIssue(id: string | number) {
  return getItem("/cybersecurity", id);
}

export async function createCybersecurityIssue(data: unknown) {
  return createItem("/cybersecurity", data);
}

export async function updateCybersecurityIssue(id: string | number, data: unknown) {
  return updateItem("/cybersecurity", id, data);
}

// Surveys
export async function getSurveys(params?: Record<string, string>) {
  return getPaginatedList("/surveys", params);
}

export async function getSurvey(id: string | number) {
  return getItem("/surveys", id);
}

export async function createSurvey(data: unknown) {
  return createItem("/surveys", data);
}

export async function respondToSurvey(id: string | number, data: unknown) {
  return apiPost<{ data: unknown; message: string }>(`/surveys/${id}/respond`, data);
}

// Reports
export async function getReports(params?: Record<string, string>) {
  return getPaginatedList("/reports", params);
}

export async function getReport(id: string | number) {
  return getItem("/reports", id);
}

export async function createReport(data: unknown) {
  return createItem("/reports", data);
}

export async function exportReport(id: string | number) {
  return apiGet<Blob>(`/reports/${id}/export`);
}

// Notifications
export async function getNotifications(params?: Record<string, string>) {
  return getPaginatedList("/notifications", params);
}

export async function getNotification(id: string | number) {
  return getItem("/notifications", id);
}

export async function getUnreadNotificationCount() {
  return apiGet<{ count: number }>("/notifications/unread-count");
}

export async function getRecentNotifications(limit?: number) {
  const params = limit ? `?limit=${limit}` : "";
  return apiGet<{ notifications: unknown[]; unread_count: number }>(`/notifications/recent${params}`);
}

export async function getNotificationStatistics() {
  return apiGet<{
    total: number;
    unread: number;
    read: number;
    today: number;
    this_week: number;
    by_type: Record<string, number>;
    by_priority: Record<string, number>;
  }>("/notifications/statistics");
}

export async function markNotificationAsRead(id: string | number) {
  return apiPost<{ message: string; data: unknown }>(`/notifications/${id}/read`, {});
}

export async function markNotificationAsUnread(id: string | number) {
  return apiPost<{ message: string; data: unknown }>(`/notifications/${id}/unread`, {});
}

export async function markAllNotificationsAsRead() {
  return apiPost<{ message: string; count: number }>("/notifications/read-all", {});
}

export async function deleteNotification(id: string | number) {
  return apiPost<{ message: string }>(`/notifications/${id}/delete`, {});
}

export async function deleteAllReadNotifications() {
  return apiPost<{ message: string; count: number }>("/notifications/read/delete-all", {});
}

export async function deleteAllNotifications() {
  return apiPost<{ message: string; count: number }>("/notifications/all/clear", {});
}

// Profile & Account Management
export async function updateProfile(data: { name?: string; email?: string; phone?: string; department?: string }) {
  return apiPost<{ user: unknown; message: string }>("/auth/profile/update", data);
}

export async function changePassword(data: { current_password: string; password: string; password_confirmation: string }) {
  return apiPost<{ message: string }>("/auth/change-password", data);
}

export async function getActivityLogs(params?: Record<string, string>) {
  return getPaginatedList("/auth/activity-logs", params);
}

export async function getSessions() {
  return apiGet<{ sessions: unknown[] }>("/auth/sessions");
}

export async function revokeSession(id: string | number) {
  return apiPost<{ message: string }>(`/auth/sessions/${id}/revoke`, {});
}

export async function revokeAllOtherSessions() {
  return apiPost<{ message: string; revoked_count: number }>("/auth/sessions/revoke-all", {});
}

// Settings
export async function getSettings() {
  return apiGet<{
    general: Record<string, unknown>;
    branding: Record<string, unknown>;
    security: Record<string, unknown>;
    notifications: Record<string, unknown>;
    workflow: Record<string, unknown>;
  }>("/settings");
}

export async function updateSettings(data: Record<string, unknown>) {
  return apiPost<{ message: string; data: Record<string, unknown> }>("/settings/update", data);
}

// Duplication Cases
export async function getDuplicationCases(params?: Record<string, string>) {
  return getPaginatedList("/duplications", params);
}

export async function getDuplicationCase(id: string | number) {
  return getItem("/duplications", id);
}

export async function createDuplicationCase(data: unknown) {
  return createItem("/duplications", data);
}

// Feasibility Studies
export async function getFeasibilityStudies(params?: Record<string, string>) {
  return getPaginatedList("/feasibility-studies", params);
}

export async function getFeasibilityStudy(id: string | number) {
  return getItem("/feasibility-studies", id);
}

export async function createFeasibilityStudy(data: unknown) {
  return createItem("/feasibility-studies", data);
}

export async function updateFeasibilityStudy(id: string | number, data: unknown) {
  return updateItem("/feasibility-studies", id, data);
}

// Export axios-like api object for compatibility
export const api = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
};
