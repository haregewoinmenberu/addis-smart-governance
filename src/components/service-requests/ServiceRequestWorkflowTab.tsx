import { Card, CardContent } from '@/components/ui/card';

interface ServiceRequestWorkflowTabProps {
  serviceRequest: any;
  onUpdate: () => void;
}

export default function ServiceRequestWorkflowTab({ serviceRequest, onUpdate }: ServiceRequestWorkflowTabProps) {
  return (
    <Card>
      <CardContent className="p-6 text-center text-gray-500">
        <p className="mb-2">Workflow stages coming soon...</p>
        <p className="text-sm">
          Service request workflow management will be implemented similar to research workflow with configurable
          stages.
        </p>
      </CardContent>
    </Card>
  );
}
