import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard/subcity")({
  component: () => (
    <ProtectedRoute permission="view_subcity_dashboard">
      <AppShell>
        <SubcityDashboard />
      </AppShell>
    </ProtectedRoute>
  ),
});

function SubcityDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Subcity Dashboard"
        subtitle="View subcity-level governance metrics and reports"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Subcity Overview</CardTitle>
          <CardDescription>
            Subcity-level statistics and performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Subcity dashboard content coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
