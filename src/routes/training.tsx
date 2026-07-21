import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";

export const Route = createFileRoute("/training")({
  component: () => (
    <ProtectedRoute permission="view_training">
      <AppShell>
        <TrainingPage />
      </AppShell>
    </ProtectedRoute>
  ),
});

function TrainingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Training Management</h1>
        <p className="text-muted-foreground">
          Manage training programs, schedules, and certifications
        </p>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">Training management interface coming soon</p>
      </div>
    </div>
  );
}
