import { apiClient } from "@/lib/api";
import type { Role, Permission } from "@/types/rbac";

// ==================== ROLES API ====================

export interface RolesListParams {
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface CreateRoleData {
  name: string;
  display_name: string;
  description?: string;
  permissions?: number[];
}

export interface UpdateRoleData {
  display_name?: string;
  description?: string;
  permissions?: number[];
}

export const rolesApi = {
  /**
   * Get all roles
   */
  list: async (params?: RolesListParams) => {
    const response = await apiClient.get<{ data: Role[] }>('/roles', { params });
    return response.data;
  },

  /**
   * Get a single role
   */
  get: async (id: number) => {
    const response = await apiClient.get<{ role: Role; users_count: number }>(`/roles/${id}`);
    return response.data;
  },

  /**
   * Create a new role
   */
  create: async (data: CreateRoleData) => {
    const response = await apiClient.post<{ message: string; role: Role }>('/roles', data);
    return response.data;
  },

  /**
   * Update a role
   */
  update: async (id: number, data: UpdateRoleData) => {
    const response = await apiClient.put<{ message: string; role: Role }>(`/roles/${id}`, data);
    return response.data;
  },

  /**
   * Delete a role
   */
  delete: async (id: number) => {
    const response = await apiClient.delete<{ message: string }>(`/roles/${id}`);
    return response.data;
  },

  /**
   * Assign permissions to a role
   */
  assignPermissions: async (id: number, permissions: number[]) => {
    const response = await apiClient.post<{ message: string; role: Role }>(
      `/roles/${id}/permissions`,
      { permissions }
    );
    return response.data;
  },

  /**
   * Get users assigned to a role
   */
  users: async (id: number, page = 1) => {
    const response = await apiClient.get(`/roles/${id}/users`, { params: { page } });
    return response.data;
  },
};

// ==================== PERMISSIONS API ====================

export interface PermissionsListParams {
  module?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
  paginate?: boolean;
  group_by_module?: boolean;
}

export interface CreatePermissionData {
  name: string;
  display_name: string;
  module?: string;
  description?: string;
}

export interface UpdatePermissionData {
  display_name?: string;
  module?: string;
  description?: string;
}

export const permissionsApi = {
  /**
   * Get all permissions
   */
  list: async (params?: PermissionsListParams) => {
    const response = await apiClient.get<Permission[] | { data: Permission[] }>('/permissions', { params });
    return response.data;
  },

  /**
   * Get permission modules
   */
  modules: async () => {
    const response = await apiClient.get<string[]>('/permissions/modules');
    return response.data;
  },

  /**
   * Get a single permission
   */
  get: async (id: number) => {
    const response = await apiClient.get<{ permission: Permission; roles_count: number }>(`/permissions/${id}`);
    return response.data;
  },

  /**
   * Create a new permission
   */
  create: async (data: CreatePermissionData) => {
    const response = await apiClient.post<{ message: string; permission: Permission }>('/permissions', data);
    return response.data;
  },

  /**
   * Update a permission
   */
  update: async (id: number, data: UpdatePermissionData) => {
    const response = await apiClient.put<{ message: string; permission: Permission }>(`/permissions/${id}`, data);
    return response.data;
  },

  /**
   * Delete a permission
   */
  delete: async (id: number) => {
    const response = await apiClient.delete<{ message: string }>(`/permissions/${id}`);
    return response.data;
  },

  /**
   * Get roles that have this permission
   */
  roles: async (id: number) => {
    const response = await apiClient.get<Role[]>(`/permissions/${id}/roles`);
    return response.data;
  },
};

// ==================== USER ROLES API ====================

export const userRolesApi = {
  /**
   * Assign roles to a user
   */
  assign: async (userId: number, roleIds: number[]) => {
    const response = await apiClient.post(`/users/${userId}/roles`, { roles: roleIds });
    return response.data;
  },

  /**
   * Remove role from a user
   */
  remove: async (userId: number, roleId: number) => {
    const response = await apiClient.delete(`/users/${userId}/roles/${roleId}`);
    return response.data;
  },

  /**
   * Get user's roles
   */
  get: async (userId: number) => {
    const response = await apiClient.get<{ roles: Role[] }>(`/users/${userId}/roles`);
    return response.data;
  },
};
