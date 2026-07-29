import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppShell } from '@/components/layout/AppShell';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileCheck, RefreshCw, ArrowRight } from 'lucide-react';
import { researchWorkflowAPI } from '@/lib/research-workflow-api';
import { toast } from 'sonner';

export const Route = createFileRoute('/research/officer/submissions')({
  component: () => (
    <RequireAuth>
      <AppShell>
        <OfficerSubmissionsPage />
      </AppShell>
    </RequireAuth>
  ),
});

const STATUS_COLOR: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending_review:    'default',
  approved:          'outline',
  revision_requested:'destructive',
  rejected:          'destructive',
};

function OfficerSubmissionsPage() {
  const navigate = useNavigate();
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await researchWorkflowAPI.getOfficerSubmissions();
      if (res.success) setData(res.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const items: any[] = data?.data ?? [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-primary" />
            My Submissions
          </h1>
          <p className="text-muted-foreground">Evaluation stages you have submitted for review</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSubmissions}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submitted Stages ({data?.total ?? items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading…
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              No submitted stages yet. Complete and submit evaluation stages to see them here.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item: any) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-accent/40 transition-colors gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{item.research_idea?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Stage: <strong>{item.stage?.name}</strong>
                    </p>
                    {item.submitted_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted: {new Date(item.submitted_at).toLocaleString()}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-sm mt-1 text-muted-foreground line-clamp-1">
                        Notes: {item.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_COLOR[item.status] ?? 'outline'}>
                      {item.status.replace(/_/g, ' ')}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate({
                          to: '/research/ideas/$id/workflow/$progressId/work',
                          params: {
                            id: String(item.research_idea_id),
                            progressId: String(item.id),
                          },
                        })
                      }
                    >
                      View <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
