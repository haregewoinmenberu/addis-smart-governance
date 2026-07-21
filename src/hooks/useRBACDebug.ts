import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

/**
 * Hook for debugging RBAC issues (development only)
 */
export function useRBACDebug() {
  const { data: debugInfo, isLoading, refetch } = useQuery({
    queryKey: ["rbac", "debug"],
    queryFn: async () => {
      const response = await apiClient.get("/rbac/debug");
      return response.data;
    },
    enabled: import.meta.env.DEV, // Only in development
  });

  const checkPermission = async (permission: string) => {
    const response = await apiClient.get(`/rbac/debug/check-permission/${permission}`);
    return response.data;
  };

  const checkRole = async (role: string) => {
    const response = await apiClient.get(`/rbac/debug/check-role/${role}`);
    return response.data;
  };

  return {
    debugInfo,
    isLoading,
    refetch,
    checkPermission,
    checkRole,
  };
}
