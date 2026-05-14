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
    return user.permissions.includes(permission);
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissions: PermissionName[]): boolean => {
    if (!user) return false;
    return permissions.some((permission) => user.permissions.includes(permission));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissions: PermissionName[]): boolean => {
    if (!user) return false;
    return permissions.every((permission) => user.permissions.includes(permission));
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
   * Check if user is Sub-City Administrator
   */
  const isSubCityAdmin = (): boolean => {
    return hasRole('sub_city_administrator');
  };

  /**
   * Check if user is Auditor
   */
  const isAuditor = (): boolean => {
    return hasRole('auditor');
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isITDBAdmin,
    isSubCityAdmin,
    isAuditor,
    user,
  };
}
