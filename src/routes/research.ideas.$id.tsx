import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/RequireAuth";

export const Route = createFileRoute("/research/ideas/$id")({
  component: () => (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  ),
});
