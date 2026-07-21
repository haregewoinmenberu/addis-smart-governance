import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, hasAnyPermission, hasAllPermissions } from "@/lib/rbac";
import type { PermissionName } from "@/types/rbac";

interface NavItemConfig {
  to: string;
  label: string;
  icon: React.ElementType;
  permission?: PermissionName;
  permissions?: PermissionName[];
  requireAll?: boolean;
  badge?: string;
  children?: NavItemConfig[];
}

interface PermissionBasedNavProps {
  items: NavItemConfig[];
  children: (visibleItems: NavItemConfig[]) => React.ReactNode;
}

/**
 * Component that filters navigation items based on user permissions
 * and passes the filtered list to a render prop
 */
export function PermissionBasedNav({ items, children }: PermissionBasedNavProps) {
  const { user } = useAuth();

  const visibleItems = useMemo(() => {
    if (!user) return [];

    return items.filter((item) => {
      // If specific permission is required
      if (item.permission) {
        return hasPermission(user, item.permission);
      }

      // If multiple permissions are specified
      if (item.permissions) {
        return item.requireAll
          ? hasAllPermissions(user, item.permissions)
          : hasAnyPermission(user, item.permissions);
      }

      // No permission requirement - show to all authenticated users
      return true;
    }).map((item) => {
      // Recursively filter children if they exist
      if (item.children) {
        return {
          ...item,
          children: item.children.filter((child) => {
            if (child.permission) {
              return hasPermission(user, child.permission);
            }
            if (child.permissions) {
              return child.requireAll
                ? hasAllPermissions(user, child.permissions)
                : hasAnyPermission(user, child.permissions);
            }
            return true;
          }),
        };
      }
      return item;
    });
  }, [user, items]);

  return <>{children(visibleItems)}</>;
}

/**
 * Hook to get filtered navigation items based on user permissions
 */
export function usePermissionBasedNav(items: NavItemConfig[]): NavItemConfig[] {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) return [];

    return items.filter((item) => {
      if (item.permission) {
        return hasPermission(user, item.permission);
      }
      if (item.permissions) {
        return item.requireAll
          ? hasAllPermissions(user, item.permissions)
          : hasAnyPermission(user, item.permissions);
      }
      return true;
    }).map((item) => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter((child) => {
            if (child.permission) {
              return hasPermission(user, child.permission);
            }
            if (child.permissions) {
              return child.requireAll
                ? hasAllPermissions(user, child.permissions)
                : hasAnyPermission(user, child.permissions);
            }
            return true;
          }),
        };
      }
      return item;
    });
  }, [user, items]);
}

/**
 * Higher-order component that wraps a component and only renders it if user has required permissions
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: PermissionName | PermissionName[],
  requireAll = false
) {
  return function PermissionWrappedComponent(props: P) {
    const { user } = useAuth();

    if (!user) return null;

    const hasAccess = Array.isArray(permission)
      ? requireAll
        ? hasAllPermissions(user, permission)
        : hasAnyPermission(user, permission)
      : hasPermission(user, permission);

    if (!hasAccess) return null;

    return <Component {...props} />;
  };
}
