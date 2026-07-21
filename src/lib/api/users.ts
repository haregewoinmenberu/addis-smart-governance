import { apiClient } from './client';
import type { User, Role } from '@/types/rbac';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  position?: string;
  department?: string;
  user_type: 'INTERNAL' | 'INSTITUTIONAL' | 'EXTERNAL';
  institution_id?: number;
  roles: string[];
  is_active?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  position?: string;
  department?: string;
  user_type?: 'INTERNAL' | 'INSTITUTIONAL' | 'EXTERNAL';
  institution_id?: number;
  roles?: string[];
  is_active?: boolean;
}

export interface UserListResponse {
  data: User[];
  meta: {
    manageable_roles: string[];
    can_create_users: boolean;
  };
}

export interface ManageableRolesResponse {
  data: Role[];
  meta: {
    can_create_users: boolean;
    hierarchy_level: number;
  };
}

export interface HierarchyInfo {
  user: {
    id: number;
    name: string;
    department: string;
    roles: string[];
  };
  capabilities: {
    can_create_users: boolean;
    can_manage_count: number;
  };
  manageable_roles: string[];
  hierarchy_map: Record<string, string[]>;
}

export const usersApi = {
  /**
   * Get list of users (filtered by hierarchy).
   */
  list: async (params?: {
    role?: string;
    institution_id?: number;
    user_type?: string;
    is_active?: boolean;
    department?: string;
    search?: string;
  }): Promise<UserListResponse> => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  /**
   * Get a single user by ID.
   */
  get: async (id: number): Promise<{ data: User }> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Create a new user (with hierarchy validation).
   */
  create: async (data: CreateUserData): Promise<{ message: string; data: User }> => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  /**
   * Update a user (with hierarchy validation).
   */
  update: async (id: number, data: UpdateUserData): Promise<{ message: string; data: User }> => {
    const response = await apiClient.post(`/users/${id}/update`, data);
    return response.data;
  },

  /**
   * Delete a user (with hierarchy validation).
   */
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.post(`/users/${id}/delete`);
    return response.data;
  },

  /**
   * Toggle user active status.
   */
  toggleActive: async (id: number): Promise<{ message: string; data: User }> => {
    const response = await apiClient.post(`/users/${id}/toggle-active`);
    return response.data;
  },

  /**
   * Reset user password.
   */
  resetPassword: async (id: number, password: string, password_confirmation: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/users/${id}/reset-password`, {
      password,
      password_confirmation,
    });
    return response.data;
  },

  /**
   * Get roles that current user can assign (based on hierarchy).
   */
  getManageableRoles: async (): Promise<ManageableRolesResponse> => {
    const response = await apiClient.get('/users/manageable-roles');
    return response.data;
  },

  /**
   * Get hierarchy information for current user.
   */
  getHierarchyInfo: async (): Promise<HierarchyInfo> => {
    const response = await apiClient.get('/users/hierarchy-info');
    return response.data;
  },

  /**
   * Get user activity logs.
   */
  getActivityLogs: async (id: number): Promise<any> => {
    const response = await apiClient.get(`/users/${id}/activity`);
    return response.data;
  },
};
