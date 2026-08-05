import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";

export const Route = createFileRoute("/research/workflow-stages")({
  component: () => (
    <ProtectedRoute permission="manage_workflow_stages">
      <AppShell>
        <Outlet />
      </AppShell>
    </ProtectedRoute>
  ),
});
