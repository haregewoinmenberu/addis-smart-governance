import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";
import { SubCityDashboard } from "@/components/dashboard/SubCityDashboard";

export const Route = createFileRoute("/dashboard/subcity")({
  component: () => (
    <ProtectedRoute permission="view_subcity_dashboard">
      <AppShell>
        <SubCityDashboard />
      </AppShell>
    </ProtectedRoute>
  ),
});
