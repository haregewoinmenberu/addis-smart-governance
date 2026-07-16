import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";
import { EnhancedInstitutionDashboard } from "@/components/dashboard/EnhancedInstitutionDashboard";
import { z } from "zod";

const searchSchema = z.object({
  tab: z.string().optional(),
});

export const Route = createFileRoute("/dashboard/institution")({
  validateSearch: (search) => searchSchema.parse(search),
  component: () => (
    <ProtectedRoute permission="view_institution_dashboard">
      <AppShell>
        <EnhancedInstitutionDashboard />
      </AppShell>
    </ProtectedRoute>
  ),
});
