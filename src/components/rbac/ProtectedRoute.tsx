import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, hasRole } from "@/lib/rbac";
import type { PermissionName, RoleName } from "@/types/rbac";

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: PermissionName | PermissionName[];
  role?: RoleName | RoleName[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Protected Route Component
 * Wraps content that requires specific permissions or roles
 */
export function ProtectedRoute({
  children,
  permission,
  role,
  fallback,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} />;
  }

  // Check role requirement
  if (role && !hasRole(user, role)) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Check permission requirement
  if (permission && !hasPermission(user, permission)) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
