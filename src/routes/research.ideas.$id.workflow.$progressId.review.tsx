import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppShell } from '@/components/layout/AppShell';
import { useState, useEffect, type ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { researchWorkflowAPI } from '@/lib/research-workflow-api';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { ResearchWorkflowProgress, UploadedStageFile } from '@/types/research-workflow';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/research/ideas/$id/workflow/$progressId/review')({
  component: () => (
    <RequireAuth>
      <ReviewStagePage />
    </RequireAuth>
  ),
});

function ReviewStagePage() {
  const { id, progressId } = Route.useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<ResearchWorkflowProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [decision, setDecision] = useState<string>('');
  const [reviewComments, setReviewComments] = useState('');

  useEffect(() => {
    fetchProgress();
  }, [progressId]);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const response = await researchWorkflowAPI.getProgressItem(progressId);
      if (response.success) {
        setProgress(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching progress:', error);
      toast.error(error.message || 'Failed to load stage data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!decision) {
      toast.error('Please select a decision');
      return;
    }

    if (!reviewComments || reviewComments.length < 10) {
      toast.error('Please provide review comments (at least 10 characters)');
      return;
    }

    setSubmitting(true);
    try {
      const response = await researchWorkflowAPI.reviewStage(progressId, {
        decision,
        review_comments: reviewComments,
      });

      if (response.success) {
        toast.success('Review submitted successfully');
        navigate({
          to: '/research/ideas/$id/workspace',
          params: { id },
          search: { tab: 'workflow' },
        });
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate({
      to: '/research/ideas/$id/workspace',
      params: { id },
      search: { tab: 'workflow' },
    });
  };

  const renderFieldValue = (field: any, value: any) => {
    if (!field || !field.name) return null;

    const label = field.label || field.name.replace(/_/g, ' ');

    let body: ReactNode;

    if (value === null || value === undefined || value === '') {
      body = <p className="text-sm text-muted-foreground italic">Not provided</p>;
    } else if (field.type === 'checkbox') {
      body = <Badge variant={value === true ? 'default' : 'outline'}>{value === true ? 'Yes' : 'No'}</Badge>;
    } else if (field.type === 'select') {
      const option = (field.options || []).find((opt: { value: string; label: string }) => opt.value === value);
      body = <p className="text-sm">{option ? option.label : String(value)}</p>;
    } else if (field.type === 'file' && typeof value === 'object' && value.path) {
      const file = value as UploadedStageFile;
      body = (
        <button
          type="button"
          onClick={() =>
            navigate({
              to: '/documents/$id',
              params: { id: progressId },
              search: {
                type: 'research-workflow',
                path: file.path,
                name: file.original_name,
                fileType: file.mime,
                attachmentId: '',
                returnTo: `/research/ideas/${id}/workflow/${progressId}/review`,
              },
            })
          }
          className="text-sm text-primary hover:underline flex items-center gap-1.5"
        >
          <FileText className="h-3.5 w-3.5" /> {file.original_name}
        </button>
      );
    } else {
      body = <p className="text-sm whitespace-pre-wrap">{String(value)}</p>;
    }

    return (
      <div key={field.name} className="space-y-2">
        <Label className="font-medium">{label}</Label>
        <div className="p-3 bg-gray-50 rounded-md">{body}</div>
      </div>
    );
  };

  if (loading) {
    return (
      <AppShell>
        <div className="container mx-auto p-6">
          <div className="text-center">Loading...</div>
        </div>
      </AppShell>
    );
  }

  if (!progress) {
    return (
      <AppShell>
        <div className="container mx-auto p-6">
          <div className="text-center text-red-600">Stage not found</div>
        </div>
      </AppShell>
    );
  }

  if (progress.status !== 'pending_review') {
    return (
      <AppShell>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-lg font-medium">This stage is not pending review</p>
              <p className="text-sm text-muted-foreground mt-2">
                Current status: <Badge>{progress.status.replace(/_/g, ' ')}</Badge>
              </p>
              <Button onClick={handleBack} className="mt-4">
                Back to Workflow
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto p-6 max-w-4xl">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Workflow
        </Button>

        <div className="space-y-6">
          {/* Stage Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Review: {progress.stage?.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{progress.stage?.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {progress.assigned_user && (
                <div>
                  <Label className="text-sm text-muted-foreground">Submitted by</Label>
                  <p className="font-medium">{progress.assigned_user.name}</p>
                </div>
              )}
              {progress.submitted_at && (
                <div>
                  <Label className="text-sm text-muted-foreground">Submitted at</Label>
                  <p className="font-medium">{new Date(progress.submitted_at).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submitted Work */}
          <Card>
            <CardHeader>
              <CardTitle>Submitted Work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {progress.stage?.form_fields && progress.stage.form_fields.length > 0 ? (
                <>
                  {progress.stage.form_fields
                    .filter((field: any) => field && field.name)
                    .map((field: any) => {
                      const value = progress.stage_data?.[field.name];
                      return renderFieldValue(field, value);
                    })}

                  {progress.notes && (
                    <div className="space-y-2 pt-4 border-t">
                      <Label className="font-medium">Additional Notes</Label>
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-sm whitespace-pre-wrap">{progress.notes}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No submitted data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Form */}
          <Card>
            <CardHeader>
              <CardTitle>Your Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Decision *</Label>
                <RadioGroup value={decision} onValueChange={setDecision}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="approved" id="approved" />
                    <Label htmlFor="approved" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Approve</p>
                        <p className="text-xs text-muted-foreground">
                          The work meets requirements and can proceed
                        </p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="revision_requested" id="revision_requested" />
                    <Label htmlFor="revision_requested" className="flex items-center gap-2 cursor-pointer flex-1">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium">Request Revision</p>
                        <p className="text-xs text-muted-foreground">
                          The work needs improvements or corrections
                        </p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="rejected" id="rejected" />
                    <Label htmlFor="rejected" className="flex items-center gap-2 cursor-pointer flex-1">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium">Reject</p>
                        <p className="text-xs text-muted-foreground">
                          The work does not meet requirements
                        </p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-comments">
                  Review Comments *
                  <span className="text-xs text-muted-foreground ml-2">(minimum 10 characters)</span>
                </Label>
                <Textarea
                  id="review-comments"
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Provide detailed feedback on the submitted work..."
                  rows={6}
                  className="w-full"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmitReview}
                  disabled={submitting || !decision || reviewComments.length < 10}
                  className="flex-1"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
