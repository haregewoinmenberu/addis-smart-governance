import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";

export const Route = createFileRoute("/projects")({
  component: () => (
    <ProtectedRoute permission="view_projects">
      <AppShell>
        <ProjectsPage />
      </AppShell>
    </ProtectedRoute>
  ),
});

function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project Management</h1>
        <p className="text-muted-foreground">
          Manage projects, milestones, and deliverables
        </p>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">Project management interface coming soon</p>
      </div>
    </div>
  );
}
