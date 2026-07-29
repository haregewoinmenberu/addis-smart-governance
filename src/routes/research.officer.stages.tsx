import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppShell } from '@/components/layout/AppShell';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GitBranch, RefreshCw, PlayCircle, ArrowRight } from 'lucide-react';
import { researchWorkflowAPI } from '@/lib/research-workflow-api';
import { toast } from 'sonner';

export const Route = createFileRoute('/research/officer/stages')({
  component: () => (
    <RequireAuth>
      <AppShell>
        <OfficerStagesPage />
      </AppShell>
    </RequireAuth>
  ),
});

const STATUS_COLOR: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  not_started:       'secondary',
  in_progress:       'default',
  pending_review:    'default',
  approved:          'outline',
  revision_requested:'destructive',
  rejected:          'destructive',
};

function OfficerStagesPage() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [stages, setStages]           = useState<Record<number, any[]>>({});
  const [loading, setLoading]         = useState(true);
  const [expanded, setExpanded]       = useState<Set<number>>(new Set());

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await researchWorkflowAPI.getOfficerAssignments('in_progress');
      if (res.success) {
        const items: any[] = res.data?.data ?? [];
        setAssignments(items);
        // Auto-expand first
        if (items.length > 0) setExpanded(new Set([items[0].research_idea_id]));
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const fetchStages = async (ideaId: number) => {
    try {
      const res = await researchWorkflowAPI.getOfficerStages(String(ideaId));
      if (res.success) {
        setStages(prev => ({ ...prev, [ideaId]: res.data }));
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load stages');
    }
  };

  const toggleExpand = async (ideaId: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(ideaId)) {
        next.delete(ideaId);
      } else {
        next.add(ideaId);
        if (!stages[ideaId]) fetchStages(ideaId);
      }
      return next;
    });
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" />
            Evaluation Stages
          </h1>
          <p className="text-muted-foreground">Your active evaluation workflow stages</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAll}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading…
        </div>
      ) : assignments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No active evaluation assignments. Check back once your assignments are accepted.
          </CardContent>
        </Card>
      ) : (
        assignments.map((a: any) => (
          <Card key={a.id}>
            <CardHeader
              className="cursor-pointer hover:bg-accent/30 transition-colors rounded-t-lg"
              onClick={() => toggleExpand(a.research_idea_id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{a.research_idea?.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{a.research_idea?.research_category?.replace(/_/g, ' ')}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge>{a.status.replace(/_/g, ' ')}</Badge>
                  <Button variant="ghost" size="sm">
                    {expanded.has(a.research_idea_id) ? 'Collapse' : 'Expand'}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expanded.has(a.research_idea_id) && (
              <CardContent>
                {!stages[a.research_idea_id] ? (
                  <div className="py-4 text-center text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin inline mr-2" /> Loading stages…
                  </div>
                ) : stages[a.research_idea_id].length === 0 ? (
                  <p className="text-muted-foreground py-4 text-center">No stages initialized yet.</p>
                ) : (
                  <div className="space-y-2">
                    {stages[a.research_idea_id].map((stage: any) => (
                      <div key={stage.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{stage.stage?.name}</p>
                          <p className="text-xs text-muted-foreground">Stage #{stage.stage?.stage_order}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={STATUS_COLOR[stage.status] ?? 'outline'}>
                            {stage.status.replace(/_/g, ' ')}
                          </Badge>
                          {['not_started', 'in_progress'].includes(stage.status) && (
                            <Button
                              size="sm"
                              onClick={() =>
                                navigate({
                                  to: '/research/ideas/$id/workflow/$progressId/work',
                                  params: {
                                    id: String(a.research_idea_id),
                                    progressId: String(stage.id),
                                  },
                                })
                              }
                            >
                              <PlayCircle className="h-4 w-4 mr-1" />
                              {stage.status === 'not_started' ? 'Start' : 'Continue'}
                            </Button>
                          )}
                          {['pending_review', 'revision_requested'].includes(stage.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate({
                                  to: '/research/ideas/$id/workflow/$progressId/work',
                                  params: {
                                    id: String(a.research_idea_id),
                                    progressId: String(stage.id),
                                  },
                                })
                              }
                            >
                              View <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
