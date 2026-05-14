import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// Create a single QueryClient instance that persists across navigations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent', // Preload on hover/focus
    defaultPreloadStaleTime: 0,
  });

  return router;
};

// Export the queryClient for use in components
export { queryClient };

