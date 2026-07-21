import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";

export const Route = createFileRoute("/development")({
  component: () => (
    <ProtectedRoute permission="review_code">
      <AppShell>
        <DevelopmentPage />
      </AppShell>
    </ProtectedRoute>
  ),
});

function DevelopmentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Development</h1>
        <p className="text-muted-foreground">
          Code reviews, pull requests, and releases
        </p>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">Development interface coming soon</p>
      </div>
    </div>
  );
}
