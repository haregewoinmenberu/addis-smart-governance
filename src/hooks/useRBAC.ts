import { useRoles } from "./useRoles";
import { usePermissions } from "./usePermissions";
import { useAuth } from "@/contexts/AuthContext";
import type { RoleName, PermissionName } from "@/types/rbac";

/**
 * Comprehensive RBAC hook combining roles, permissions, and user info
 */
export function useRBAC() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const roles = useRoles();
  const permissions = usePermissions();

  /**
   * Check if user can perform an action (checks both roles and permissions)
   */
  const can = (permission: PermissionName, role?: RoleName): boolean => {
    if (!isAuthenticated || !user) return false;

    // If role is specified, check role first
    if (role && !roles.hasRole(role)) {
      return false;
    }

    // Check permission
    return permissions.hasPermission(permission);
  };

  /**
   * Check if user can perform any of the actions
   */
  const canAny = (permissionList: PermissionName[], roleList?: RoleName[]): boolean => {
    if (!isAuthenticated || !user) return false;

    // Check roles if provided
    if (roleList && roleList.length > 0) {
      if (!roles.hasAnyRole(roleList)) {
        return false;
      }
    }

    // Check permissions
    return permissions.hasAnyPermission(permissionList);
  };

  /**
   * Check if user can perform all of the actions
   */
  const canAll = (permissionList: PermissionName[], roleList?: RoleName[]): boolean => {
    if (!isAuthenticated || !user) return false;

    // Check roles if provided
    if (roleList && roleList.length > 0) {
      if (!roles.hasAllRoles(roleList)) {
        return false;
      }
    }

    // Check permissions
    return permissions.hasAllPermissions(permissionList);
  };

  /**
   * Check if user is authorized for a specific module
   */
  const canAccessModule = (moduleName: string): boolean => {
    if (!isAuthenticated || !user) return false;

    // Get all permissions for the module
    const modulePermissions = user.permissions?.filter(p => 
      p.startsWith(`view_${moduleName}`) || 
      p.includes(moduleName)
    ) ?? [];

    return modulePermissions.length > 0;
  };

  /**
   * Check if user is an administrator
   */
  const isAdmin = (): boolean => {
    return roles.hasRole('itdb_administrator');
  };

  /**
   * Check if user is an auditor
   */
  const isAuditor = (): boolean => {
    return roles.hasRole('itdb_auditor');
  };

  /**
   * Check if user is internal staff
   */
  const isInternal = (): boolean => {
    return user?.user_type === 'INTERNAL';
  };

  /**
   * Check if user is institutional
   */
  const isInstitutional = (): boolean => {
    return user?.user_type === 'INSTITUTIONAL';
  };

  /**
   * Check if user is external
   */
  const isExternal = (): boolean => {
    return user?.user_type === 'EXTERNAL';
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    // Permission checks
    can,
    canAny,
    canAll,
    canAccessModule,
    // Role checks
    ...roles,
    // Permission list
    ...permissions,
    // User type checks
    isAdmin,
    isAuditor,
    isInternal,
    isInstitutional,
    isExternal,
  };
}
