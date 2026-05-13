type ApiOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const TOKEN_KEY = "strp_token";

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let payload: (T & { message?: string }) | undefined;
  try {
    payload = (await response.json()) as T & { message?: string };
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    const message = payload?.message ?? "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

export async function apiGet<T>(path: string) {
  return apiFetch<T>(path);
}

export async function apiPost<T>(path: string, body: unknown) {
  return apiFetch<T>(path, { method: "POST", body });
}

export async function login(email: string, password: string) {
  const data = await apiPost<{ access_token: string }>("/auth/login", { email, password });
  if (data.access_token) {
    setAuthToken(data.access_token);
  }
  return data;
}

export async function getDashboard() {
  return apiGet<{ stats: unknown[]; investment: unknown[]; subcity: unknown[]; compliance: unknown[]; insights: unknown[]; approvals: unknown[]; readiness: unknown[] }>(
    "/dashboard",
  );
}

export async function getModule(key: string) {
  return apiGet<{ data: { title: string; subtitle: string; points: string[] } }>(`/modules/${key}`);
}

export async function getList<T>(endpoint: string) {
  return apiGet<{ data: T[] }>(endpoint);
}
