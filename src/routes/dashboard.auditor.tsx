import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";
import { AuditorDashboard } from "@/components/dashboard/AuditorDashboard";

export const Route = createFileRoute("/dashboard/auditor")({
  component: () => (
    <ProtectedRoute permission="view_auditor_dashboard">
      <AppShell>
        <AuditorDashboard />
      </AppShell>
    </ProtectedRoute>
  ),
});
