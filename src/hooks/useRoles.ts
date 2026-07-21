import { useAuth } from "@/contexts/AuthContext";
import type { RoleName } from "@/types/rbac";

/**
 * Hook to check user roles
 */
export function useRoles() {
  const { user } = useAuth();

  /**
   * Check if user has a specific role
   */
  const hasRole = (roleName: RoleName): boolean => {
    if (!user) return false;
    return user.roles?.some(role => role.name === roleName) ?? false;
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roleNames: RoleName[]): boolean => {
    if (!user || !roleNames.length) return false;
    return roleNames.some(roleName => hasRole(roleName));
  };

  /**
   * Check if user has all of the specified roles
   */
  const hasAllRoles = (roleNames: RoleName[]): boolean => {
    if (!user || !roleNames.length) return false;
    return roleNames.every(roleName => hasRole(roleName));
  };

  /**
   * Get all user roles
   */
  const getRoles = () => {
    return user?.roles ?? [];
  };

  /**
   * Get user's primary role (first role)
   */
  const getPrimaryRole = () => {
    return user?.roles?.[0];
  };

  return {
    hasRole,
    hasAnyRole,
    hasAllRoles,
    getRoles,
    getPrimaryRole,
  };
}
