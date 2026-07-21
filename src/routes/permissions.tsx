import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";
import { PermissionManagementPage } from "@/pages/PermissionManagementPage";

export const Route = createFileRoute("/permissions")({
  component: () => (
    <ProtectedRoute permission="view_dashboard">
      <AppShell>
        <PermissionManagementPage />
      </AppShell>
    </ProtectedRoute>
  ),
});
