import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppShell } from '@/components/layout/AppShell';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, RefreshCw, ArrowRight, CheckCircle } from 'lucide-react';
import { researchWorkflowAPI } from '@/lib/research-workflow-api';
import { toast } from 'sonner';

export const Route = createFileRoute('/research/officer/assignments')({
  component: () => (
    <RequireAuth>
      <AppShell>
        <OfficerAssignmentsPage />
      </AppShell>
    </RequireAuth>
  ),
});

const categoryLabel: Record<string, string> = {
  system_new:                   'New System Development',
  system_transfer:              'System Transfer/Adoption',
  system_upgrade:               'System Upgrade',
  infrastructure_cloud:         'Cloud Infrastructure',
  infrastructure_server:        'Server Infrastructure',
  infrastructure_network:       'Network Infrastructure',
  infrastructure_storage:       'Storage Infrastructure',
  infrastructure_security:      'Security Infrastructure',
  infrastructure_data_center:   'Data Center',
};

const STATUSES = ['', 'pending', 'accepted', 'in_progress', 'completed'];

function OfficerAssignmentsPage() {
  const navigate = useNavigate();
  const [data, setData]           = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [accepting, setAccepting] = useState<number | null>(null);
  const [filter, setFilter]       = useState('');

  const fetchAssignments = async (status = filter) => {
    setLoading(true);
    try {
      const res = await researchWorkflowAPI.getOfficerAssignments(status || undefined);
      if (res.success) setData(res.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignments(); }, []);

  const handleAccept = async (assignmentId: number) => {
    setAccepting(assignmentId);
    try {
      const res = await researchWorkflowAPI.acceptOfficerAssignment(String(assignmentId));
      if (res.success) {
        toast.success('Assignment accepted');
        fetchAssignments();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept assignment');
    } finally {
      setAccepting(null);
    }
  };

  const items: any[] = data?.data ?? [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            Assigned Evaluations
          </h1>
          <p className="text-muted-foreground">All ICT evaluation requests assigned to you</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchAssignments()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map(s => (
          <Button
            key={s || 'all'}
            size="sm"
            variant={filter === s ? 'default' : 'outline'}
            onClick={() => { setFilter(s); fetchAssignments(s); }}
          >
            {s ? s.replace(/_/g, ' ') : 'All'}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignments ({data?.total ?? items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading…
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No assignments found.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item: any) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-accent/40 transition-colors gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{item.research_idea?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {categoryLabel[item.research_idea?.research_category] ?? item.research_idea?.research_category}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Assigned: {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge>{item.status.replace(/_/g, ' ')}</Badge>
                    <Badge variant="outline">{item.research_idea?.priority}</Badge>
                    {item.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleAccept(item.id)}
                        disabled={accepting === item.id}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {accepting === item.id ? 'Accepting…' : 'Accept'}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate({
                          to: '/research/ideas/$id/workspace',
                          params: { id: String(item.research_idea_id) },
                          search: { tab: 'workflow' },
                        })
                      }
                    >
                      Open <ArrowRight className="h-4 w-4 ml-1" />
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
