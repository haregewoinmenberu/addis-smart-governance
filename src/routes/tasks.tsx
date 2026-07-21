import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";

export const Route = createFileRoute("/tasks")({
  component: () => (
    <ProtectedRoute permission="create_tasks">
      <AppShell>
        <TasksPage />
      </AppShell>
    </ProtectedRoute>
  ),
});

function TasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
        <p className="text-muted-foreground">
          Create, assign, and track development tasks
        </p>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">Task management interface coming soon</p>
      </div>
    </div>
  );
}
