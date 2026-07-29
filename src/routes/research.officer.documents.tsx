import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ArrowRight } from 'lucide-react';

export const Route = createFileRoute('/research/officer/documents')({
  component: () => (
    <RequireAuth>
      <AppShell>
        <OfficerDocumentsPage />
      </AppShell>
    </RequireAuth>
  ),
});

function OfficerDocumentsPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Download className="h-6 w-6 text-primary" />
          My Uploaded Documents
        </h1>
        <p className="text-muted-foreground">
          Documents are uploaded as part of each evaluation stage's assessment form.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>How to Upload Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Open an evaluation request from <strong>Assigned Evaluations</strong></li>
            <li>Navigate to the <strong>Workflow</strong> tab in the workspace</li>
            <li>Start or continue a stage that requires document upload</li>
            <li>Use the file attachment control in the assessment form to upload supporting documents</li>
          </ol>
          <Button className="mt-4" onClick={() => navigate({ to: '/research/officer/assignments' })}>
            Go to Assigned Evaluations <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
