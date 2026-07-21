import type { User, Role, Permission, PermissionName, RoleName } from "@/types/rbac";

/**
 * Get user's primary role
 */
export function getUserPrimaryRole(user: User | null): Role | null {
  if (!user || !user.roles || user.roles.length === 0) return null;
  return user.roles[0];
}

/**
 * Get user's role names
 */
export function getUserRoleNames(user: User | null): RoleName[] {
  if (!user || !user.roles) return [];
  return user.roles.map((role) => role.name as RoleName);
}

/**
 * Check if user has admin role
 */
export function isAdminUser(user: User | null): boolean {
  return getUserRoleNames(user).includes("itdb_administrator");
}

/**
 * Check if user has any leadership role
 */
export function isLeadershipRole(roleName: string): boolean {
  const leadershipRoles = [
    "bureau_head",
    "smart_city_sector_head",
    "development_sector_head",
    "operation_sector_head",
  ];
  return leadershipRoles.includes(roleName);
}

/**
 * Check if user has any director role
 */
export function isDirectorRole(roleName: string): boolean {
  return roleName.includes("_director");
}

/**
 * Check if user has team leader role
 */
export function isTeamLeaderRole(roleName: string): boolean {
  return roleName.includes("_team_leader");
}

/**
 * Format role display name
 */
export function formatRoleDisplay(role: Role): string {
  return role.display_name || role.name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Format permission display name
 */
export function formatPermissionDisplay(permission: Permission): string {
  return permission.display_name || permission.name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Group permissions by action (view, create, edit, delete)
 */
export function groupPermissionsByAction(permissions: Permission[]): Record<string, Permission[]> {
  const grouped: Record<string, Permission[]> = {
    view: [],
    create: [],
    edit: [],
    delete: [],
    manage: [],
    other: [],
  };

  permissions.forEach((permission) => {
    const action = permission.name.split("_")[0];
    if (grouped[action]) {
      grouped[action].push(permission);
    } else {
      grouped.other.push(permission);
    }
  });

  return grouped;
}

/**
 * Get permission color based on action
 */
export function getPermissionColor(permissionName: string): string {
  const action = permissionName.split("_")[0];
  const colorMap: Record<string, string> = {
    view: "bg-blue-100 text-blue-800 border-blue-300",
    create: "bg-green-100 text-green-800 border-green-300",
    edit: "bg-yellow-100 text-yellow-800 border-yellow-300",
    delete: "bg-red-100 text-red-800 border-red-300",
    manage: "bg-purple-100 text-purple-800 border-purple-300",
    approve: "bg-indigo-100 text-indigo-800 border-indigo-300",
  };
  return colorMap[action] || "bg-gray-100 text-gray-800 border-gray-300";
}

/**
 * Sort roles by hierarchy level
 */
export function sortRolesByHierarchy(roles: Role[]): Role[] {
  const hierarchyOrder: Record<string, number> = {
    bureau_head: 1,
    smart_city_sector_head: 2,
    development_sector_head: 2,
    operation_sector_head: 2,
    capacity_building_director: 3,
    research_director: 3,
    security_director: 3,
    project_director: 3,
    software_development_director: 3,
    infrastructure_director: 3,
    maintenance_director: 3,
    data_center_director: 3,
    quality_director: 3,
  };

  return [...roles].sort((a, b) => {
    const orderA = hierarchyOrder[a.name] || 999;
    const orderB = hierarchyOrder[b.name] || 999;
    return orderA - orderB;
  });
}

/**
 * Check if permission is critical
 */
export function isCriticalPermission(permissionName: string): boolean {
  const criticalActions = ["delete", "manage", "override"];
  const action = permissionName.split("_")[0];
  return criticalActions.includes(action) || permissionName.includes("admin");
}

/**
 * Get permission category
 */
export function getPermissionCategory(permission: Permission): string {
  return permission.module || "general";
}

/**
 * Filter permissions by search term
 */
export function filterPermissions(permissions: Permission[], searchTerm: string): Permission[] {
  if (!searchTerm) return permissions;
  
  const term = searchTerm.toLowerCase();
  return permissions.filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      p.display_name.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term))
  );
}

/**
 * Get role statistics
 */
export function getRoleStats(role: Role): {
  permissionCount: number;
  userCount: number;
  hasUsers: boolean;
} {
  return {
    permissionCount: role.permissions?.length || 0,
    userCount: 0, // Would need to be passed from API
    hasUsers: false, // Would need to be passed from API
  };
}

/**
 * Validate role name format
 */
export function isValidRoleName(name: string): boolean {
  return /^[a-z_]+$/.test(name);
}

/**
 * Validate permission name format
 */
export function isValidPermissionName(name: string): boolean {
  return /^[a-z_]+$/.test(name);
}

/**
 * Get suggested permissions for a role based on its name
 */
export function getSuggestedPermissions(roleName: string): string[] {
  if (roleName.includes("admin")) {
    return ["view_", "create_", "edit_", "delete_", "manage_"];
  }
  if (roleName.includes("director") || roleName.includes("head")) {
    return ["view_", "approve_", "manage_"];
  }
  if (roleName.includes("officer") || roleName.includes("developer")) {
    return ["view_", "create_", "edit_"];
  }
  return ["view_"];
}
