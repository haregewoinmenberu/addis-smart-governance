import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppShell } from '@/components/layout/AppShell';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ClipboardList, GitBranch, UserCog, FileCheck, CheckCircle2,
  AlertTriangle, ArrowRight, RefreshCw, LayoutDashboard, Bell,
} from 'lucide-react';
import { researchWorkflowAPI } from '@/lib/research-workflow-api';
import { toast } from 'sonner';

export const Route = createFileRoute('/research/team-leader/dashboard')({
  component: () => (
    <RequireAuth>
      <AppShell>
        <TeamLeaderDashboardPage />
      </AppShell>
    </RequireAuth>
  ),
});

const statusColor: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  under_review: 'secondary',
  approved: 'default',
  rejected: 'destructive',
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

function TeamLeaderDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await researchWorkflowAPI.getTeamLeaderDashboard();
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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">Team Leader Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Overview of research assigned to your team
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDashboard}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Assigned Research" value={data?.assigned_research ?? 0} icon={ClipboardList} />
        <StatCard title="Active" value={data?.active_research ?? 0} icon={GitBranch} color="text-blue-500" />
        <StatCard title="Unassigned Officers" value={data?.pending_officer_assignments ?? 0} icon={UserCog} color="text-yellow-500" />
        <StatCard title="Pending Reviews" value={data?.pending_reviews ?? 0} icon={FileCheck} color="text-orange-500" />
        <StatCard title="Completed" value={data?.completed_research ?? 0} icon={CheckCircle2} color="text-green-500" />
        <StatCard title="Overdue Tasks" value={data?.overdue_tasks ?? 0} icon={AlertTriangle} color="text-red-500" />
      </div>

      {/* Progress Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Research Progress
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate({ to: '/research/team-leader/reviews' })}>
            Pending Reviews <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {data?.progress_summary?.length > 0 ? (
            <div className="space-y-3">
              {data.progress_summary.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.assigned_officers?.length > 0
                        ? `Officers: ${item.assigned_officers.join(', ')}`
                        : 'No officers assigned yet'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <Badge variant={statusColor[item.status] ?? 'outline'}>
                      {String(item.status).replace(/_/g, ' ')}
                    </Badge>
                    <div className="w-28">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${item.progress ?? 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-right mt-1">{item.progress ?? 0}%</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate({
                          to: '/research/ideas/$id/workspace',
                          params: { id: String(item.id) },
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
            <p className="text-center text-muted-foreground py-8">No research assigned yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Overdue Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Overdue Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.overdue_items?.length > 0 ? (
            <div className="space-y-3">
              {data.overdue_items.map((item: any, idx: number) => (
                <div key={`${item.id}-${idx}`} className="flex items-center justify-between p-3 border rounded-lg border-red-200 bg-red-50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Stage: {item.stage} &nbsp;|&nbsp; Assigned to: {item.assigned_to}
                    </p>
                  </div>
                  <Badge variant="destructive">Due {item.due_date}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nothing overdue. Great work!</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recent_activities?.length > 0 ? (
            <div className="space-y-2">
              {data.recent_activities.map((activity: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-sm border-b last:border-b-0 pb-2 last:pb-0">
                  <span>{activity.description}</span>
                  <span className="text-muted-foreground">
                    {activity.user} · {activity.created_at ? new Date(activity.created_at).toLocaleString() : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No recent activity.</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Assigned Research', icon: ClipboardList, to: '/research/ideas/team-leader' },
          { label: 'Pending Reviews', icon: FileCheck, to: '/research/team-leader/reviews' },
          { label: 'Notifications', icon: Bell, to: '/notifications' },
        ].map((link) => (
          <Button
            key={link.label}
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
