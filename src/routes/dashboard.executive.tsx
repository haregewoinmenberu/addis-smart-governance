import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";
import { ExecutiveDashboard } from "@/components/dashboard/ExecutiveDashboard";

export const Route = createFileRoute("/dashboard/executive")({
  component: () => (
    <ProtectedRoute permission="view_executive_dashboard">
      <AppShell>
        <ExecutiveDashboard />
      </AppShell>
    </ProtectedRoute>
  ),
});
