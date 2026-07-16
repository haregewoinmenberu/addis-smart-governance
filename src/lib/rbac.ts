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
  if (!user) return false;
  
  const permissions = Array.isArray(permission) ? permission : [permission];
  
  if (user.user_type === 'INSTITUTIONAL') {
    const implicit = ['view_dashboard', 'view_institution_dashboard', 'view_notifications'];
    if (permissions.some(p => implicit.includes(p))) {
      return true;
    }
  }
  
  if (!user.permissions) return false;
  return permissions.some(p => user.permissions.includes(p));
}

/**
 * Check if user has any of the given permissions
 */
export function hasAnyPermission(user: User | null | undefined, permissions: PermissionName[]): boolean {
  if (!user) return false;
  
  if (user.user_type === 'INSTITUTIONAL') {
    const implicit = ['view_dashboard', 'view_institution_dashboard', 'view_notifications'];
    if (permissions.some(p => implicit.includes(p))) {
      return true;
    }
  }
  
  if (!user.permissions) return false;
  return permissions.some(p => user.permissions.includes(p));
}

/**
 * Check if user has all of the given permissions
 */
export function hasAllPermissions(user: User | null | undefined, permissions: PermissionName[]): boolean {
  if (!user) return false;
  return permissions.every(p => hasPermission(user, p));
}

/**
 * Check if user is ITDB Administrator
 */
export function isITDBAdmin(user: User | null | undefined): boolean {
  return hasRole(user, 'itdb_administrator');
}

/**
 * Check if user is Auditor
 */
export function isAuditor(user: User | null | undefined): boolean {
  return hasRole(user, 'itdb_auditor');
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
 * Check if user can view resource
 */
export function canViewResource(
  user: User | null | undefined
): boolean {
  if (!user) return false;
  
  // ITDB Admin and Auditor can view all
  if (isITDBAdmin(user) || isAuditor(user)) return true;
  
  return false;
}

/**
 * Check if user can edit resource (based on ownership)
 */
export function canEditResource(
  user: User | null | undefined,
  resourceOwnerId?: number
): boolean {
  if (!user) return false;
  
  // ITDB Admin can edit all
  if (isITDBAdmin(user)) return true;
  
  // Check ownership
  const ownsResource = resourceOwnerId === user.id;
  return ownsResource;
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
 * Get dashboard route based on user permissions.
 * Resolves the most appropriate dashboard a user is allowed to see.
 */
export function getDashboardRoute(user: User | null | undefined): string {
  console.log('[getDashboardRoute] Evaluating dashboard for user:', user?.email);
  
  if (!user) {
    console.log('[getDashboardRoute] No user, returning /login');
    return '/login';
  }

  console.log('[getDashboardRoute] User permissions:', user.permissions);
  console.log('[getDashboardRoute] User type:', user.user_type);

  // Priority order: Check specific dashboards first
  
  // Executive Dashboard (highest priority - ITDB Admin only)
  if (hasPermission(user, 'view_executive_dashboard')) {
    console.log('[getDashboardRoute] Matched: Executive Dashboard');
    return '/dashboard/executive';
  }
  
  // Auditor Dashboard
  if (hasPermission(user, 'view_auditor_dashboard')) {
    console.log('[getDashboardRoute] Matched: Auditor Dashboard');
    return '/dashboard/auditor';
  }
  
  // Institution Dashboard
  if (user.user_type === 'INSTITUTIONAL' || hasPermission(user, 'view_institution_dashboard')) {
    console.log('[getDashboardRoute] Matched: Institution Dashboard');
    return '/dashboard/institution';
  }
  
  // Research Dashboard (includes Smart City Command Center)
  if (hasPermission(user, 'view_research_dashboard')) {
    console.log('[getDashboardRoute] Matched: Research Dashboard');
    return '/dashboard/research';
  }
  
  // Licensing Dashboard
  if (hasPermission(user, 'view_licensing_dashboard')) {
    console.log('[getDashboardRoute] Matched: Licensing Dashboard');
    return '/dashboard/licensing';
  }
  
  // Technology Transfer Dashboard
  if (hasPermission(user, 'view_technology_transfer_dashboard')) {
    console.log('[getDashboardRoute] Matched: Technology Transfer Dashboard');
    return '/dashboard/technology-transfer';
  }

  // SubCity Dashboard
  if (hasPermission(user, 'view_subcity_dashboard')) {
    console.log('[getDashboardRoute] Matched: SubCity Dashboard');
    return '/dashboard/subcity';
  }

  // Main dashboard (for users with view_dashboard permission)
  if (hasPermission(user, 'view_dashboard')) {
    console.log('[getDashboardRoute] Matched: Main Dashboard');
    return '/dashboard/main';
  }

  // Fallback: No access page for users without any dashboard permissions
  // This prevents infinite redirect loops
  console.warn('[getDashboardRoute] No dashboard permissions found, returning /dashboard/no-access');
  return '/dashboard/no-access';
}

/**
 * Format role name for display
 */
export function formatRoleName(role: RoleName): string {
  const roleNames: Record<RoleName, string> = {
    itdb_administrator: 'ITDB Administrator',
    itdb_auditor: 'ITDB Auditor',
  };
  return roleNames[role] || role;
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: RoleName): string {
  const colors: Record<RoleName, string> = {
    itdb_administrator: 'bg-purple-100 text-purple-800 border-purple-200',
    itdb_auditor: 'bg-amber-100 text-amber-800 border-amber-200',
  };
  return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
}
