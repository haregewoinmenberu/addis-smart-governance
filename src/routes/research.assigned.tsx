import { createFileRoute } from '@tanstack/react-router';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/dashboard/PageHeader';
import AssignedResearchList from '@/components/research/AssignedResearchList';

export const Route = createFileRoute('/research/assigned')({
  component: () => (
    <RequireAuth>
      <AppShell>
        <PageHeader
          title="Assigned Research"
          subtitle="Research projects assigned to you"
        />
        <div className="p-6">
          <AssignedResearchList />
        </div>
      </AppShell>
    </RequireAuth>
  ),
});
