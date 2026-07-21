import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";

export const Route = createFileRoute("/infrastructure")({
  component: () => (
    <ProtectedRoute permission="view_infrastructure">
      <AppShell>
        <InfrastructurePage />
      </AppShell>
    </ProtectedRoute>
  ),
});

function InfrastructurePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Infrastructure Management</h1>
        <p className="text-muted-foreground">
          Manage network, servers, and firewall configurations
        </p>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">Infrastructure management interface coming soon</p>
      </div>
    </div>
  );
}
