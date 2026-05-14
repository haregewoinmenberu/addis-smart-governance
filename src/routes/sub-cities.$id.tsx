import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

export const Route = createFileRoute("/sub-cities/$id")({
  component: () => (
    <RequireAuth>
      <PermissionGuard permission="view_sub_cities">
        <Outlet />
      </PermissionGuard>
    </RequireAuth>
  ),
});
