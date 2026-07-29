import { Card, CardContent } from '@/components/ui/card';

interface ServiceRequestHistoryTabProps {
  serviceRequest: any;
}

export default function ServiceRequestHistoryTab({ serviceRequest }: ServiceRequestHistoryTabProps) {
  return (
    <Card>
      <CardContent className="p-6 text-center text-gray-500">
        <p className="mb-2">Activity history coming soon...</p>
        <p className="text-sm">
          Service request activity history will show all assignments, status changes, reviews, and comments.
        </p>
      </CardContent>
    </Card>
  );
}
