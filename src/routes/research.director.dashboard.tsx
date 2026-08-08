import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getAuthToken } from '@/lib/api';
import {
  Target,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  UserPlus,
  AlertCircle,
  Lightbulb,
  ClipboardCheck,
  Eye,
  BarChart3,
  Settings,
} from 'lucide-react';

export const Route = createFileRoute('/research/director/dashboard')({
  component: () => (
    <RequireAuth>
      <ResearchDirectorDashboard />
    </RequireAuth>
  ),
});

interface DashboardStats {
  total_requests: number;
  pending_assignment: number;
  under_evaluation: number;
  completed: number;
  approved: number;
  rejected: number;
  team_leaders: number;
  officers: number;
  active_stages: number;
  pending_reviews: number;
}

interface RecentRequest {
  id: number;
  title: string;
  research_category: string;
  status: string;
  priority?: string;
  submitted_at: string;
  assigned_to_director?: number;
  submitter?: { name: string };
}

function StatCard({
  title,
  value,
  icon: Icon,
  color = 'text-primary',
  bgColor = 'bg-primary/10',
  trend,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color?: string;
  bgColor?: string;
  trend?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`h-10 w-10 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
      </CardContent>
    </Card>
  );
}

function ResearchDirectorDashboard() {
  const navigate = useNavigate();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['research-director-stats'],
    queryFn: async () => {
      const res = await fetch('/api/research/director/stats', {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
  });

  const { data: recentData, isLoading: recentLoading } = useQuery({
    queryKey: ['research-director-recent'],
    queryFn: async () => {
      const res = await fetch('/api/research-ideas?per_page=5', {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error('Failed to fetch recent requests');
      return res.json();
    },
  });

  const stats: DashboardStats = statsData?.data || {
    total_requests: 0,
    pending_assignment: 0,
    under_evaluation: 0,
    completed: 0,
    approved: 0,
    rejected: 0,
    team_leaders: 0,
    officers: 0,
    active_stages: 0,
    pending_reviews: 0,
  };

  const recentRequests: RecentRequest[] = recentData?.data || [];

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 border-gray-300',
    submitted: 'bg-blue-100 text-blue-700 border-blue-300',
    under_review: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    approved: 'bg-green-100 text-green-700 border-green-300',
    rejected: 'bg-red-100 text-red-700 border-red-300',
    on_hold: 'bg-orange-100 text-orange-700 border-orange-300',
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Research Director Dashboard"
            subtitle="Oversee technology evaluation and research management"
          />
          <div className="flex gap-2">
            <Button onClick={() => navigate({ to: "/research/workflow-stages" })}>
              <Eye className="h-4 w-4 mr-2" />
              Workflow Stages
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Requests"
            value={stats.total_requests}
            icon={Lightbulb}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <StatCard
            title="Pending Assignment"
            value={stats.pending_assignment}
            icon={Clock}
            color="text-amber-600"
            bgColor="bg-amber-100"
            trend="Requires team leader assignment"
          />
          <StatCard
            title="Under Evaluation"
            value={stats.under_evaluation}
            icon={Target}
            color="text-purple-600"
            bgColor="bg-purple-100"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle}
            color="text-green-600"
            bgColor="bg-green-100"
          />
        </div>

        {/* Decision Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Approved Requests"
            value={stats.approved}
            icon={CheckCircle}
            color="text-green-600"
            bgColor="bg-green-100"
          />
          <StatCard
            title="Rejected Requests"
            value={stats.rejected}
            icon={AlertCircle}
            color="text-red-600"
            bgColor="bg-red-100"
          />
          <StatCard
            title="Pending Reviews"
            value={stats.pending_reviews}
            icon={ClipboardCheck}
            color="text-yellow-600"
            bgColor="bg-yellow-100"
            trend="Awaiting your review"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Requests */}
          <Card className="lg:col-span-2">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Technology Requests</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: "/research/ideas" })}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
              ) : recentRequests.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No recent requests</p>
                </div>
              ) : (
                <div className="divide-y">
                  {recentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => navigate({ to: `/research/ideas/${request.id}` })}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{request.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            By {request.submitter?.name || "Unknown"} •{" "}
                            {new Date(request.submitted_at || new Date()).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${
                              statusColors[request.status] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {request.status?.replace(/_/g, " ")}
                          </span>
                          {request.priority && (
                            <span className="text-xs text-muted-foreground capitalize">
                              {request.priority} priority
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & Team Overview */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate({ to: "/research/ideas/create" })}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  New Request
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate({ to: "/research/assignments" })}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Team Leaders
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate({ to: "/research/team" })}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Team
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate({ to: "/research/reports" })}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </CardContent>
            </Card>

            {/* Team Overview */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">Team Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">Team Leaders</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.team_leaders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">Officers</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.officers}</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Active Stages</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.active_stages}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
