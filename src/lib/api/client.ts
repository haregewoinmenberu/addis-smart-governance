import { apiFetch, ApiError } from '../api';

export { ApiError };

// Re-export the apiFetch as apiClient for compatibility
export const apiClient = {
  get: async <T = any>(url: string, config?: { params?: Record<string, any> }) => {
    const queryString = config?.params 
      ? '?' + new URLSearchParams(
          Object.entries(config.params).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null) {
              acc[key] = String(value);
            }
            return acc;
          }, {} as Record<string, string>)
        ).toString()
      : '';
    const data = await apiFetch<T>(`${url}${queryString}`);
    return { data };
  },
  
  post: async <T = any>(url: string, data?: any, config?: any) => {
    const result = await apiFetch<T>(url, {
      method: 'POST',
      body: data,
      headers: config?.headers,
    });
    return { data: result };
  },
  
  put: async <T = any>(url: string, data?: any) => {
    const result = await apiFetch<T>(url, {
      method: 'PUT',
      body: data,
    });
    return { data: result };
  },
  
  delete: async <T = any>(url: string) => {
    const result = await apiFetch<T>(url, {
      method: 'DELETE',
    });
    return { data: result };
  },
};

// Helper function from api.ts
async function apiFetch<T>(path: string, options: any = {}): Promise<T> {
  const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
  const TOKEN_KEY = "strp_token";
  
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers: Record<string, string> = {
    "Accept": "application/json",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers ?? {}),
  };

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body
      ? (isFormData ? (options.body as FormData) : JSON.stringify(options.body))
      : undefined,
    credentials: 'omit',
  });

  let payload: (T & { message?: string }) | undefined;
  try {
    payload = (await response.json()) as T & { message?: string };
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    if (response.status === 401 && !path.includes('/auth/me')) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/login";
    }
    const message = payload?.message ?? "Request failed";
    throw new ApiError(message, response.status);
  }

  return payload as T;
}
