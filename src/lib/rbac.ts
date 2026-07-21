import type { User, RoleName, PermissionName } from "@/types/rbac";

/**
 * Check if user has a specific role
 */
export function hasRole(user: User | null, role: RoleName | RoleName[]): boolean {
  if (!user || !user.roles) return false;

  if (Array.isArray(role)) {
    return role.some((r) => user.roles?.some((userRole) => userRole.name === r));
  }

  return user.roles.some((userRole) => userRole.name === role);
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  user: User | null,
  permission: PermissionName | PermissionName[]
): boolean {
  if (!user || !user.permissions) return false;

  if (Array.isArray(permission)) {
    return permission.some((p) => user.permissions?.includes(p));
  }

  return user.permissions.includes(permission);
}

/**
 * Check if user has all specified permissions
 */
export function hasAllPermissions(
  user: User | null,
  permissions: PermissionName[]
): boolean {
  if (!user || !user.permissions) return false;
  return permissions.every((p) => user.permissions?.includes(p));
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  user: User | null,
  permissions: PermissionName[]
): boolean {
  if (!user || !user.permissions) return false;
  return permissions.some((p) => user.permissions?.includes(p));
}

/**
 * Get badge color for role
 */
export function getRoleBadgeColor(role: RoleName): string {
  const colorMap: Record<RoleName, string> = {
    itdb_administrator: "bg-purple-100 text-purple-800 border-purple-300",
    itdb_auditor: "bg-blue-100 text-blue-800 border-blue-300",
  };

  return colorMap[role] || "bg-gray-100 text-gray-800 border-gray-300";
}

/**
 * Format role name for display
 */
export function formatRoleName(role: RoleName): string {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Format permission name for display
 */
export function formatPermissionName(permission: PermissionName): string {
  return permission
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Group permissions by module
 */
export function groupPermissionsByModule(
  permissions: PermissionName[]
): Record<string, PermissionName[]> {
  const grouped: Record<string, PermissionName[]> = {};

  permissions.forEach((permission) => {
    // Extract module from permission name (e.g., "view_users" -> "users")
    const parts = permission.split("_");
    const module = parts.length > 1 ? parts[parts.length - 1] : "general";

    if (!grouped[module]) {
      grouped[module] = [];
    }
    grouped[module].push(permission);
  });

  return grouped;
}

/**
 * Check if user is administrator
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, "itdb_administrator");
}

/**
 * Check if user is auditor
 */
export function isAuditor(user: User | null): boolean {
  return hasRole(user, "itdb_auditor");
}

/**
 * Check if user can manage a specific resource
 */
export function canManage(user: User | null, resource: string): boolean {
  if (isAdmin(user)) return true;

  const managePermissions: PermissionName[] = [
    `create_${resource}` as PermissionName,
    `edit_${resource}` as PermissionName,
    `delete_${resource}` as PermissionName,
  ];

  return hasAnyPermission(user, managePermissions);
}

/**
 * Get user's primary role
 */
export function getPrimaryRole(user: User | null): RoleName | null {
  if (!user || !user.roles || user.roles.length === 0) return null;
  return user.roles[0].name;
}

/**
 * Check if user can access dashboard
 */
export function canAccessDashboard(user: User | null, dashboard: string): boolean {
  const dashboardPermission = `view_${dashboard}_dashboard` as PermissionName;
  return hasPermission(user, dashboardPermission);
}

/**
 * Get the primary dashboard route for user based on their permissions and role
 */
export function getDashboardRoute(user: User | null): string {
  if (!user) return "/login";

  // Check for institutional users - redirect directly to institution dashboard
  if (user.user_type === "INSTITUTIONAL" && hasPermission(user, "view_institution_dashboard")) {
    return "/dashboard/institution?tab=my-requests";
  }

  // Check if user has bureau_head role
  const isBureauHead = user.roles?.some(role => role.name === "bureau_head");
  if (isBureauHead && hasPermission(user, "view_executive_dashboard")) {
    return "/dashboard/bureau-head";
  }

  // Priority order for dashboard routes (for internal staff)
  const dashboardChecks = [
    { permission: "view_executive_dashboard" as PermissionName, route: "/dashboard/executive" },
    { permission: "view_reports_dashboard" as PermissionName, route: "/reports" },
    { permission: "view_dashboard" as PermissionName, route: "/dashboard/main" },
    { permission: "view_auditor_dashboard" as PermissionName, route: "/dashboard/auditor" },
    { permission: "view_research_dashboard" as PermissionName, route: "/dashboard/research" },
    { permission: "view_licensing_dashboard" as PermissionName, route: "/dashboard/licensing" },
    { permission: "view_technology_transfer_dashboard" as PermissionName, route: "/dashboard/technology-transfer" },
    { permission: "view_subcity_dashboard" as PermissionName, route: "/dashboard/subcity" },
  ];

  for (const check of dashboardChecks) {
    if (hasPermission(user, check.permission)) {
      return check.route;
    }
  }

  return "/dashboard/no-access";
}

/**
 * Get role display name from user, role object, or role name
 */
export function getRoleDisplayName(
  input: User | { name: RoleName; display_name?: string } | RoleName | null
): string {
  if (!input) return "No Role";
  
  // If it's a User object with roles
  if (typeof input === "object" && "roles" in input && input.roles) {
    if (input.roles.length === 0) return "No Role";
    const primaryRole = input.roles[0];
    return primaryRole.display_name || formatRoleName(primaryRole.name);
  }
  
  // If it's a string (role name)
  if (typeof input === "string") {
    return formatRoleName(input);
  }
  
  // If it's a role object
  if (typeof input === "object" && "name" in input) {
    return input.display_name || formatRoleName(input.name);
  }
  
  return "No Role";
}

/**
 * Get all permissions for a user (from both roles and direct permissions)
 */
export function getAllPermissions(user: User | null): PermissionName[] {
  if (!user) return [];
  return user.permissions || [];
}

/**
 * Check if user has access to a specific route
 */
export function canAccessRoute(user: User | null, route: string): boolean {
  if (!user) return false;
  
  // Route to permission mapping
  const routePermissions: Record<string, PermissionName | PermissionName[]> = {
    "/dashboard": "view_dashboard",
    "/dashboard/executive": "view_executive_dashboard",
    "/dashboard/research": "view_research_dashboard",
    "/users": "view_users",
    "/requests": "view_requests",
    "/training": "view_training",
    "/research": "view_research",
    "/security-review": "view_security_review",
    "/projects": "view_projects",
    "/infrastructure": "view_infrastructure",
    "/tickets": "view_tickets",
    "/quality": "view_quality_review",
    "/reports": "view_reports",
    "/settings": "manage_settings",
  };

  const requiredPermission = routePermissions[route];
  if (!requiredPermission) return true; // Allow access if no specific permission is required

  if (Array.isArray(requiredPermission)) {
    return hasAnyPermission(user, requiredPermission);
  }

  return hasPermission(user, requiredPermission);
}
