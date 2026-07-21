import { useRoles } from "@/hooks/useRoles";
import type { RoleName } from "@/types/rbac";

interface RoleGateProps {
  children: React.ReactNode;
  roles: RoleName[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  onUnauthorized?: () => void;
}

/**
 * Role Gate Component
 * Advanced role checking with flexible requirements
 * 
 * @example
 * // User must have at least ONE role
 * <RoleGate roles={["itdb_administrator", "bureau_head"]}>
 *   <AdminPanel />
 * </RoleGate>
 * 
 * @example
 * // User must have ALL roles
 * <RoleGate roles={["software_developer", "project_manager"]} requireAll>
 *   <LeadDeveloperPanel />
 * </RoleGate>
 */
export function RoleGate({
  children,
  roles,
  requireAll = false,
  fallback = null,
  onUnauthorized,
}: RoleGateProps) {
  const { hasAnyRole, hasAllRoles } = useRoles();

  const isAuthorized = requireAll
    ? hasAllRoles(roles)
    : hasAnyRole(roles);

  if (!isAuthorized) {
    onUnauthorized?.();
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
