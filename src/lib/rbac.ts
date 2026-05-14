// RBAC Utility Functions

import type { User, PermissionName, RoleName } from '@/types/rbac';

/**
 * Check if user has a specific role
 */
export function hasRole(user: User | null | undefined, role: RoleName | RoleName[]): boolean {
  if (!user || !user.roles) return false;
  
  const roles = Array.isArray(role) ? role : [role];
  return user.roles.some(r => roles.includes(r.name));
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: User | null | undefined, permission: PermissionName | PermissionName[]): boolean {
  if (!user || !user.permissions) return false;
  
  const permissions = Array.isArray(permission) ? permission : [permission];
  return permissions.some(p => user.permissions.includes(p));
}

/**
 * Check if user has any of the given permissions
 */
export function hasAnyPermission(user: User | null | undefined, permissions: PermissionName[]): boolean {
  if (!user || !user.permissions) return false;
  return permissions.some(p => user.permissions.includes(p));
}

/**
 * Check if user has all of the given permissions
 */
export function hasAllPermissions(user: User | null | undefined, permissions: PermissionName[]): boolean {
  if (!user || !user.permissions) return false;
  return permissions.every(p => user.permissions.includes(p));
}

/**
 * Check if user is ITDB Administrator
 */
export function isITDBAdmin(user: User | null | undefined): boolean {
  return hasRole(user, 'itdb_administrator');
}

/**
 * Check if user is Sub-City Administrator
 */
export function isSubCityAdmin(user: User | null | undefined): boolean {
  return hasRole(user, 'sub_city_administrator');
}

/**
 * Check if user is Auditor
 */
export function isAuditor(user: User | null | undefined): boolean {
  return hasRole(user, 'auditor');
}

/**
 * Get user's primary role (first role)
 */
export function getPrimaryRole(user: User | null | undefined): RoleName | null {
  if (!user || !user.roles || user.roles.length === 0) return null;
  return user.roles[0].name;
}

/**
 * Get user's role display name
 */
export function getRoleDisplayName(user: User | null | undefined): string {
  if (!user || !user.roles || user.roles.length === 0) return 'No Role';
  return user.roles[0].display_name;
}

/**
 * Check if user can view resource (based on sub-city)
 */
export function canViewResource(
  user: User | null | undefined,
  resourceSubCity?: string
): boolean {
  if (!user) return false;
  
  // ITDB Admin and Auditor can view all
  if (isITDBAdmin(user) || isAuditor(user)) return true;
  
  // Sub-City Admin can only view their own sub-city
  if (isSubCityAdmin(user)) {
    return !resourceSubCity || resourceSubCity === user.sub_city;
  }
  
  return false;
}

/**
 * Check if user can edit resource (based on ownership)
 */
export function canEditResource(
  user: User | null | undefined,
  resourceOwnerId?: number,
  resourceSubCity?: string
): boolean {
  if (!user) return false;
  
  // ITDB Admin can edit all
  if (isITDBAdmin(user)) return true;
  
  // Sub-City Admin can edit their own resources
  if (isSubCityAdmin(user)) {
    const ownsResource = resourceOwnerId === user.id;
    const sameSubCity = !resourceSubCity || resourceSubCity === user.sub_city;
    return ownsResource || sameSubCity;
  }
  
  // Auditors cannot edit (only review)
  return false;
}

/**
 * Filter navigation items based on user permissions
 */
export function filterNavByPermissions(
  navItems: Array<{ permission?: PermissionName; role?: RoleName }>,
  user: User | null | undefined
): typeof navItems {
  if (!user) return [];
  
  return navItems.filter(item => {
    if (item.permission && !hasPermission(user, item.permission)) {
      return false;
    }
    if (item.role && !hasRole(user, item.role)) {
      return false;
    }
    return true;
  });
}

/**
 * Get dashboard route based on user role
 */
export function getDashboardRoute(user: User | null | undefined): string {
  if (!user) return '/login';
  
  if (isITDBAdmin(user)) return '/dashboard/executive';
  if (isSubCityAdmin(user)) return '/dashboard/subcity';
  if (isAuditor(user)) return '/dashboard/auditor';
  
  return '/dashboard';
}

/**
 * Format role name for display
 */
export function formatRoleName(role: RoleName): string {
  const roleNames: Record<RoleName, string> = {
    itdb_administrator: 'ITDB Administrator',
    sub_city_administrator: 'Sub-City Administrator',
    auditor: 'Auditor',
  };
  return roleNames[role] || role;
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: RoleName): string {
  const colors: Record<RoleName, string> = {
    itdb_administrator: 'bg-purple-100 text-purple-800 border-purple-200',
    sub_city_administrator: 'bg-blue-100 text-blue-800 border-blue-200',
    auditor: 'bg-green-100 text-green-800 border-green-200',
  };
  return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
}
