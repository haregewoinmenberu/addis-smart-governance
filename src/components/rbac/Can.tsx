import { useAuth } from "@/hooks/useAuth";
import { hasPermission, hasRole } from "@/lib/rbac";
import type { PermissionName, RoleName } from "@/types/rbac";

interface CanProps {
  children: React.ReactNode;
  permission?: PermissionName | PermissionName[];
  role?: RoleName | RoleName[];
  fallback?: React.ReactNode;
}

/**
 * Can Component
 * Conditionally renders children based on user permissions or roles
 * 
 * @example
 * <Can permission="create_users">
 *   <Button>Create User</Button>
 * </Can>
 * 
 * <Can role="itdb_administrator">
 *   <AdminPanel />
 * </Can>
 */
export function Can({ children, permission, role, fallback = null }: CanProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  // Check role requirement
  if (role && !hasRole(user, role)) {
    return <>{fallback}</>;
  }

  // Check permission requirement
  if (permission && !hasPermission(user, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
