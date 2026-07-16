import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { getDashboardRoute } from "@/lib/rbac";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardResolver,
});

/**
 * Resolves the exact `/dashboard` path to the most appropriate dashboard
 * for the current user, based on their permissions.
 */
function DashboardResolver() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const target = getDashboardRoute(user);
  console.log(`[DashboardResolver] Resolving dashboard for user ${user?.email}, target: ${target}`);
  
  // Prevent redirect loop - if target is still /dashboard, go to no-access
  if (target === '/dashboard' || target === '/dashboard/') {
    console.warn('[DashboardResolver] Redirect loop detected, redirecting to no-access');
    return <Navigate to="/dashboard/no-access" replace />;
  }
  
  return <Navigate to={target} replace />;
}
