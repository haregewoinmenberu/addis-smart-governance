import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getAuthToken } from '@/lib/api';
import { FileCheck, Clock, User, Calendar, ArrowRight, AlertCircle } from 'lucide-react';

export const Route = createFileRoute('/research/team-leader/reviews')({
  component: () => (
    <RequireAuth>
      <PendingReviewsPage />
    </RequireAuth>
  ),
});

function PendingReviewsPage() {
  const navigate = useNavigate();

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['team-leader-pending-reviews'],
    queryFn: async () => {
      const res = await fetch('/api/research-team-leader/pending-reviews', {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error('Failed to fetch pending reviews');
      return res.json();
    },
  });

  const reviews = reviewsData?.data || [];

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending_review: 'bg-yellow-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
      revision_requested: 'bg-orange-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-slate-400',
      medium: 'bg-blue-500',
      high: 'bg-orange-500',
      critical: 'bg-red-600',
    };
    return colors[priority] || 'bg-gray-500';
  };

  return (
    <AppShell>
      <PageHeader
        title="Pending Reviews"
        subtitle="Review officer submissions and provide feedback"
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileCheck className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Pending Reviews</h3>
            <p className="text-muted-foreground text-center max-w-md">
              All officer submissions have been reviewed. New submissions will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <Card key={review.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">
                      {review.research_idea?.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getStatusBadge(review.research_idea?.status)}>
                        {review.research_idea?.status?.replace(/_/g, ' ')}
                      </Badge>
                      <Badge className={getPriorityBadge(review.research_idea?.priority)}>
                        {review.research_idea?.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Stage Information */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-blue-600" />
                      Stage: {review.stage?.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {review.stage?.description}
                    </p>
                  </div>

                  {/* Submission Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">Submitted by</p>
                        <p className="font-medium">{review.assigned_user?.name || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">Submitted at</p>
                        <p className="font-medium">
                          {review.submitted_at
                            ? new Date(review.submitted_at).toLocaleDateString()
                            : 'Not yet'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">Status</p>
                        <Badge variant="outline" className="text-xs">
                          Pending Review
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Previous Reviews */}
                  {review.reviews && review.reviews.length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        Previous Review:
                      </p>
                      <p className="text-sm">{review.reviews[0].review_comments}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        by {review.reviews[0].reviewer?.name}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={() =>
                        navigate({
                          to: `/research/ideas/${review.research_idea_id}/workflow/${review.id}/review`,
                        })
                      }
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Review Submission
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                Review Guidelines
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Review officer submissions thoroughly before approving</li>
                <li>• Provide constructive feedback if requesting revisions</li>
                <li>• Check that all required fields are properly completed</li>
                <li>• Ensure work quality meets research standards</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
