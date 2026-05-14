import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * Component that requires authentication to render children
 * Redirects to login if not authenticated
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("RequireAuth: Not authenticated, redirecting to login");
      // Only redirect if we're not already on the login page
      if (pathname !== '/login') {
        navigate({
          to: "/login",
          search: { redirect: pathname },
          replace: true,
        });
      }
    }
  }, [isAuthenticated, isLoading, navigate, pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
