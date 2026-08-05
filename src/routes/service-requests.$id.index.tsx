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
  validateSearch: (search: Record<string, unknown>) => ({
    returnTo: (search.returnTo as string) || undefined,
  }),
});

// Redirect to workspace by default
function ServiceRequestDetailRedirect() {
  const { id } = Route.useParams();
  const { returnTo } = Route.useSearch();
  const navigate = useNavigate();

  React.useEffect(() => {
    navigate({
      to: '/service-requests/$id/workspace',
      params: { id },
      search: returnTo ? { returnTo } : undefined,
      replace: true,
    });
  }, [id, returnTo, navigate]);

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
