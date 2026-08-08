import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { getAuthToken } from '@/lib/api';
import {
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  TrendingUp,
  FileText,
  Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/research/team-leader/dashboard')({
  component: () => (
    <RequireAuth>
      <TeamLeaderDashboard />
    </RequireAuth>
  ),
});

function TeamLeaderDashboard() {
  const navigate = useNavigate();

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['team-leader-dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/research-team-leader/dashboard', {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      return res.json();
    },
  });

  const stats = dashboardData?.data || {};

  const statsCards = [
    {
      title: 'Assigned Research',
      value: stats.assigned_research || 0,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Research assigned to you',
      link: '/research/ideas/team-leader?tab=assigned',
    },
    {
      title: 'Active Research',
      value: stats.active_research || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Currently in progress',
      link: '/research/ideas/team-leader?tab=assigned',
    },
    {
      title: 'Pending Officer Assignments',
      value: stats.pending_officer_assignments || 0,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Need officer assignment',
      link: '/research/team',
    },
    {
      title: 'Pending Reviews',
      value: stats.pending_reviews || 0,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Awaiting your review',
      link: '/research/assignments',
    },
    {
      title: 'Completed Research',
      value: stats.completed_research || 0,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      description: 'Successfully completed',
      link: '/research/ideas/team-leader?tab=assigned',
    },
    {
      title: 'Overdue Tasks',
      value: stats.overdue_tasks || 0,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Past due date',
      link: '/research/assignments',
    },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Team Leader Dashboard"
        subtitle="Overview of your research team's activities and progress"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate({ to: stat.link })}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progress Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.progress_summary && stats.progress_summary.length > 0 ? (
            <div className="space-y-4">
              {stats.progress_summary.map((item: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Assigned to: {item.assigned_officers?.join(', ') || 'Not assigned'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.progress || 0}%</span>
                      <Badge className={getStatusBadgeColor(item.status)}>
                        {item.status?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.progress || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No research in progress
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities & Overdue Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recent_activities && stats.recent_activities.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_activities.slice(0, 5).map((activity: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.user} • {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No recent activities</p>
            )}
          </CardContent>
        </Card>

        {/* Overdue Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Overdue Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.overdue_items && stats.overdue_items.length > 0 ? (
              <div className="space-y-3">
                {stats.overdue_items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200"
                  >
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {new Date(item.due_date).toLocaleDateString()} •{' '}
                        {item.assigned_to}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate({ to: `/research/ideas/${item.id}/workspace` })}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-muted-foreground">No overdue items</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col"
              onClick={() => navigate({ to: '/research/ideas/team-leader?tab=assigned' })}
            >
              <Target className="h-6 w-6 mb-2" />
              <span className="text-sm">View Assigned Research</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col"
              onClick={() => navigate({ to: '/research/team' })}
            >
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">Manage Team</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col"
              onClick={() => navigate({ to: '/research/assignments' })}
            >
              <FileText className="h-6 w-6 mb-2" />
              <span className="text-sm">Review Submissions</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col"
              onClick={() => navigate({ to: '/research/ideas/create' })}
            >
              <Calendar className="h-6 w-6 mb-2" />
              <span className="text-sm">Submit Idea</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function getStatusBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-500',
    submitted: 'bg-blue-500',
    under_review: 'bg-yellow-500',
    approved: 'bg-green-500',
    in_progress: 'bg-purple-500',
    completed: 'bg-emerald-500',
    rejected: 'bg-red-500',
  };
  return colors[status] || 'bg-gray-500';
}
