import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";

export const Route = createFileRoute("/cloud")({
  component: () => (
    <ProtectedRoute permission="approve_cloud_resource">
      <AppShell>
        <CloudPage />
      </AppShell>
    </ProtectedRoute>
  ),
});

function CloudPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cloud Management</h1>
        <p className="text-muted-foreground">
          Manage cloud resources, deployments, and scaling
        </p>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">Cloud management interface coming soon</p>
      </div>
    </div>
  );
}
