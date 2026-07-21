import { useAuth } from "@/contexts/AuthContext";
import type { PermissionName } from "@/types/rbac";

/**
 * Hook to check user permissions
 */
export function usePermissions() {
  const { user } = useAuth();

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: PermissionName): boolean => {
    if (!user) return false;
    return user.permissions?.includes(permission) ?? false;
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissions: PermissionName[]): boolean => {
    if (!user || !permissions.length) return false;
    return permissions.some(permission => user.permissions?.includes(permission));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissions: PermissionName[]): boolean => {
    if (!user || !permissions.length) return false;
    return permissions.every(permission => user.permissions?.includes(permission));
  };

  /**
   * Get all user permissions
   */
  const getPermissions = (): PermissionName[] => {
    return user?.permissions ?? [];
  };

  /**
   * Check if user is ITDB Administrator
   */
  const isITDBAdmin = (): boolean => {
    if (!user) return false;
    return user.roles?.some(role => role.name === 'itdb_administrator') ?? false;
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissions,
    isITDBAdmin,
    user,
  };
}
