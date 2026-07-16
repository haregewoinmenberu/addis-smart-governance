import { useAuth } from "./useAuth";
import type { PermissionName, RoleName } from "@/types/rbac";

/**
 * Permission Hook
 * Provides utilities to check user permissions and roles
 */
export function usePermissions() {
  const { user } = useAuth();

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: PermissionName): boolean => {
    if (!user) return false;
    if (user.user_type === 'INSTITUTIONAL') {
      if (['view_dashboard', 'view_institution_dashboard', 'view_notifications'].includes(permission)) {
        return true;
      }
    }
    return user.permissions.includes(permission);
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissions: PermissionName[]): boolean => {
    if (!user) return false;
    if (user.user_type === 'INSTITUTIONAL') {
      const implicit = ['view_dashboard', 'view_institution_dashboard', 'view_notifications'];
      if (permissions.some(p => implicit.includes(p))) {
        return true;
      }
    }
    return permissions.some((permission) => user.permissions.includes(permission));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissions: PermissionName[]): boolean => {
    if (!user) return false;
    return permissions.every((permission) => hasPermission(permission));
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: RoleName): boolean => {
    if (!user) return false;
    return user.roles.some((r) => r.name === role);
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: RoleName[]): boolean => {
    if (!user) return false;
    return roles.some((role) => user.roles.some((r) => r.name === role));
  };

  /**
   * Check if user has all of the specified roles
   */
  const hasAllRoles = (roles: RoleName[]): boolean => {
    if (!user) return false;
    return roles.every((role) => user.roles.some((r) => r.name === role));
  };

  /**
   * Check if user is ITDB Administrator
   */
  const isITDBAdmin = (): boolean => {
    return hasRole('itdb_administrator');
  };

  /**
   * Check if user is Auditor
   */
  const isAuditor = (): boolean => {
    return hasAnyRole(['itdb_auditor']);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isITDBAdmin,
    isAuditor,
    user,
  };
}
