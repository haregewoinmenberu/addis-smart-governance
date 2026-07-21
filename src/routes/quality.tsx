import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";

export const Route = createFileRoute("/quality")({
  component: () => (
    <ProtectedRoute permission="view_quality_review">
      <AppShell>
        <QualityPage />
      </AppShell>
    </ProtectedRoute>
  ),
});

function QualityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quality Management</h1>
        <p className="text-muted-foreground">
          Quality reviews, testing, and compliance verification
        </p>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">Quality management interface coming soon</p>
      </div>
    </div>
  );
}
