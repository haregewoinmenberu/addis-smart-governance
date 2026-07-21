import { usePermissions } from "@/hooks/usePermissions";
import type { PermissionName } from "@/types/rbac";

interface PermissionGateProps {
  children: React.ReactNode;
  permissions: PermissionName[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  onUnauthorized?: () => void;
}

/**
 * Permission Gate Component
 * Advanced permission checking with flexible requirements
 * 
 * @example
 * // User must have at least ONE permission
 * <PermissionGate permissions={["view_users", "edit_users"]}>
 *   <UserPanel />
 * </PermissionGate>
 * 
 * @example
 * // User must have ALL permissions
 * <PermissionGate permissions={["create_users", "assign_roles"]} requireAll>
 *   <AdvancedUserCreator />
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  permissions,
  requireAll = false,
  fallback = null,
  onUnauthorized,
}: PermissionGateProps) {
  const { hasAnyPermission, hasAllPermissions } = usePermissions();

  const isAuthorized = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (!isAuthorized) {
    onUnauthorized?.();
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
