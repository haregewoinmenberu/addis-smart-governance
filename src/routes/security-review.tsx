import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";

export const Route = createFileRoute("/security-review")({
  component: () => (
    <ProtectedRoute permission="view_security_review">
      <AppShell>
        <SecurityReviewPage />
      </AppShell>
    </ProtectedRoute>
  ),
});

function SecurityReviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Reviews</h1>
        <p className="text-muted-foreground">
          Manage security assessments, vulnerability scans, and clearances
        </p>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">Security review interface coming soon</p>
      </div>
    </div>
  );
}
