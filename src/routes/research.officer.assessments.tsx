import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileCheck, ArrowRight } from 'lucide-react';

export const Route = createFileRoute('/research/officer/assessments')({
  component: () => (
    <RequireAuth>
      <AppShell>
        <OfficerAssessmentsPage />
      </AppShell>
    </RequireAuth>
  ),
});

function OfficerAssessmentsPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileCheck className="h-6 w-6 text-primary" />
          Technical Assessments
        </h1>
        <p className="text-muted-foreground">
          Assessment forms for each evaluation stage are accessible through the Evaluation Stages page.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>How to Submit Assessments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Go to <strong>Evaluation Stages</strong> from the sidebar</li>
            <li>Expand an active evaluation and click <strong>Start</strong> or <strong>Continue</strong> on a stage</li>
            <li>Fill in the assessment form for that stage</li>
            <li>Upload any required evidence documents</li>
            <li>Click <strong>Submit</strong> to send for Team Leader review</li>
          </ol>
          <Button className="mt-4" onClick={() => navigate({ to: '/research/officer/stages' })}>
            Go to Evaluation Stages <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
