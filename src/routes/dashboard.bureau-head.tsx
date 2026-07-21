import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";
import { BureauHeadDashboard } from "@/components/dashboard/BureauHeadDashboard";

export const Route = createFileRoute("/dashboard/bureau-head")({
  component: () => (
    <ProtectedRoute permission="view_executive_dashboard">
      <AppShell>
        <BureauHeadDashboard />
      </AppShell>
    </ProtectedRoute>
  ),
});
