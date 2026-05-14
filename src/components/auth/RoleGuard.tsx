import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import type { RoleName } from "@/types/rbac";

interface RoleGuardProps {
  role?: RoleName;
  roles?: RoleName[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Role Guard Component
 * Conditionally renders children based on user roles
 * 
 * @example
 * <RoleGuard role="itdb_administrator">
 *   <AdminPanel />
 * </RoleGuard>
 * 
 * @example
 * <RoleGuard roles={["itdb_administrator", "sub_city_administrator"]} requireAll={false}>
 *   <ManagementTools />
 * </RoleGuard>
 */
export function RoleGuard({
  role,
  roles,
  requireAll = false,
  fallback = null,
  children,
}: RoleGuardProps) {
  const { hasRole, hasAnyRole, hasAllRoles } = usePermissions();

  let hasAccess = false;

  if (role) {
    hasAccess = hasRole(role);
  } else if (roles) {
    hasAccess = requireAll ? hasAllRoles(roles) : hasAnyRole(roles);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
