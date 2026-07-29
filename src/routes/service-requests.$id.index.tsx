import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/service-requests/$id/')({
  component: () => (
    <RequireAuth>
      <ServiceRequestDetailRedirect />
    </RequireAuth>
  ),
});

// Redirect to workspace by default
function ServiceRequestDetailRedirect() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    navigate({ to: '/service-requests/$id/workspace', params: { id }, replace: true });
  }, [id, navigate]);

  return (
    <AppShell>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p>Loading service request workspace...</p>
        </div>
      </div>
    </AppShell>
  );
}
