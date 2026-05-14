import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import type { PermissionName } from "@/types/rbac";

interface PermissionGuardProps {
  permission?: PermissionName;
  permissions?: PermissionName[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Permission Guard Component
 * Conditionally renders children based on user permissions
 * 
 * @example
 * <PermissionGuard permission="create_users">
 *   <Button>Create User</Button>
 * </PermissionGuard>
 * 
 * @example
 * <PermissionGuard permissions={["edit_users", "delete_users"]} requireAll={false}>
 *   <UserActions />
 * </PermissionGuard>
 */
export function PermissionGuard({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
