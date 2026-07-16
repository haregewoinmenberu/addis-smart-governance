import { createFileRoute } from "@tanstack/react-router";
import { SmartCityResearchDashboard } from "@/components/research/SmartCityResearchDashboard";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";

export const Route = createFileRoute("/dashboard/research")({
  component: () => (
    <ProtectedRoute permission="view_research_dashboard">
      <AppShell>
        <SmartCityResearchDashboard />
      </AppShell>
    </ProtectedRoute>
  ),
});
