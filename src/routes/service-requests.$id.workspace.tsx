import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getAuthToken } from '@/lib/api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import ServiceRequestOverviewTab from '@/components/service-requests/ServiceRequestOverviewTab';
import ServiceRequestAssignmentTab from '@/components/service-requests/ServiceRequestAssignmentTab';
import ServiceRequestWorkflowTab from '@/components/service-requests/ServiceRequestWorkflowTab';
import ServiceRequestDocumentsTab from '@/components/service-requests/ServiceRequestDocumentsTab';
import ServiceRequestHistoryTab from '@/components/service-requests/ServiceRequestHistoryTab';

export const Route = createFileRoute('/service-requests/$id/workspace')({
  component: () => (
    <RequireAuth>
      <ServiceRequestWorkspacePage />
    </RequireAuth>
  ),
  validateSearch: (search: Record<string, unknown>) => ({
    returnTo: (search.returnTo as string) || '/service-requests',
  }),
});

function ServiceRequestWorkspacePage() {
  const { id } = Route.useParams();
  const { returnTo } = Route.useSearch();
  const navigate = useNavigate();

  // Fetch service request data
  const { data: requestData, isLoading, refetch } = useQuery({
    queryKey: ['service-request', id],
    queryFn: async () => {
      const res = await fetch(`/api/service-forms/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch service request');
      }
      return res.json();
    },
  });

  const serviceRequest = requestData?.data;

  if (isLoading) {
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

  if (!serviceRequest) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-lg font-medium">Service request not found</p>
          <Button className="mt-4" onClick={() => navigate({ to: returnTo })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Service Requests
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={`Service Request Workspace`}
        subtitle={`Reference: ${serviceRequest.reference_number}`}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: returnTo })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        }
      />

      <div className="mt-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assignment">Assignment</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <ServiceRequestOverviewTab serviceRequest={serviceRequest} onUpdate={refetch} />
          </TabsContent>

          <TabsContent value="assignment" className="mt-0">
            <ServiceRequestAssignmentTab serviceRequest={serviceRequest} onUpdate={refetch} />
          </TabsContent>

          <TabsContent value="workflow" className="mt-0">
            <ServiceRequestWorkflowTab serviceRequest={serviceRequest} onUpdate={refetch} />
          </TabsContent>

          <TabsContent value="documents" className="mt-0">
            <ServiceRequestDocumentsTab serviceRequest={serviceRequest} />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <ServiceRequestHistoryTab serviceRequest={serviceRequest} />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
