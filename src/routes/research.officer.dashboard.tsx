import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppShell } from '@/components/layout/AppShell';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ClipboardCheck, GitBranch, FileCheck, Clock,
  CheckCircle2, AlertCircle, ArrowRight, RefreshCw,
  LayoutDashboard, Bell,
} from 'lucide-react';
import { researchWorkflowAPI } from '@/lib/research-workflow-api';
import { toast } from 'sonner';

export const Route = createFileRoute('/research/officer/dashboard')({
  component: () => (
    <RequireAuth>
      <AppShell>
        <OfficerDashboardPage />
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

const statusColor: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending:          'secondary',
  accepted:         'default',
  in_progress:      'default',
  completed:        'outline',
  not_started:      'secondary',
  pending_review:   'default',
  revision_requested: 'destructive',
  approved:         'outline',
};

function StatCard({ title, value, icon: Icon, color = 'text-primary' }: { title: string; value: number; icon: React.ElementType; color?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function OfficerDashboardPage() {
  const navigate = useNavigate();
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await researchWorkflowAPI.getOfficerDashboard();
      if (res.success) setData(res.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading dashboard…</span>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">Evaluation Officer Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Welcome, <strong>{data?.user?.name}</strong> — {data?.user?.role}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDashboard}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard title="Total Assigned"    value={stats.total_assigned    ?? 0} icon={ClipboardCheck} />
        <StatCard title="Active"            value={stats.active            ?? 0} icon={GitBranch}      color="text-blue-500" />
        <StatCard title="Pending Acceptance"value={stats.pending_acceptance?? 0} icon={Clock}          color="text-yellow-500" />
        <StatCard title="Completed"         value={stats.completed         ?? 0} icon={CheckCircle2}   color="text-green-500" />
        <StatCard title="Pending Stages"    value={stats.pending_stages    ?? 0} icon={FileCheck}      color="text-orange-500" />
        <StatCard title="Submitted"         value={stats.submitted_stages  ?? 0} icon={CheckCircle2}   color="text-teal-500" />
        <StatCard title="Revisions"         value={stats.revision_stages   ?? 0} icon={AlertCircle}    color="text-red-500" />
      </div>

      {/* Pending Work Stages */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Evaluation Stages Requiring Action
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate({ to: '/research/officer/stages' })}>
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {data?.pending_stages?.length > 0 ? (
            <div className="space-y-3">
              {data.pending_stages.map((stage: any) => (
                <div key={stage.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{stage.research_title}</p>
                    <p className="text-sm text-muted-foreground">
                      Stage: {stage.stage_name} &nbsp;|&nbsp;
                      {categoryLabel[stage.category] ?? stage.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <Badge variant={statusColor[stage.status] ?? 'outline'}>
                      {stage.status.replace(/_/g, ' ')}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() =>
                        navigate({
                          to: '/research/ideas/$id/workflow/$progressId/work',
                          params: { id: String(stage.research_id), progressId: String(stage.id) },
                        })
                      }
                    >
                      {stage.status === 'not_started' ? 'Start' : 'Continue'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No pending stages. Great work!</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Assignments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Recent Assigned Evaluations
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate({ to: '/research/officer/assignments' })}>
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {data?.recent_assignments?.length > 0 ? (
            <div className="space-y-3">
              {data.recent_assignments.map((item: any) => (
                <div key={item.assignment_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.research_title}</p>
                    <p className="text-sm text-muted-foreground">
                      {categoryLabel[item.category] ?? item.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge variant={statusColor[item.status] ?? 'outline'}>
                      {item.status.replace(/_/g, ' ')}
                    </Badge>
                    <Badge variant="outline">{item.priority}</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate({
                          to: '/research/ideas/$id/workspace',
                          params: { id: String(item.research_id) },
                          search: { tab: 'workflow' },
                        })
                      }
                    >
                      Open
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No assignments yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Assigned Evaluations', icon: ClipboardCheck, to: '/research/officer/assignments' },
          { label: 'Evaluation Stages',    icon: GitBranch,      to: '/research/officer/stages' },
          { label: 'My Submissions',       icon: FileCheck,      to: '/research/officer/submissions' },
          { label: 'Notifications',        icon: Bell,           to: '/notifications' },
        ].map((link) => (
          <Button
            key={link.to}
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => navigate({ to: link.to })}
          >
            <link.icon className="h-5 w-5 text-primary" />
            <span className="text-xs text-center">{link.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
