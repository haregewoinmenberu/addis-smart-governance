import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, ListTodo, FileCheck, Calendar, ArrowRight } from 'lucide-react';
import { getResearcherDashboard } from '@/lib/api';
import { useNavigate } from '@tanstack/react-router';

export default function ResearcherDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyDashboard();
  }, []);

  const fetchMyDashboard = async () => {
    try {
      const data = await getResearcherDashboard();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading your evaluation dashboard...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {stats?.user?.name || 'Evaluation Officer'}</h1>
          <p className="text-muted-foreground">{stats?.user?.role || 'Technical Evaluation Officer'}</p>
        </div>
        <Badge variant="outline" className="px-3 py-1.5 text-sm">
          Technical Evaluation Officer
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assigned Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.my_ideas || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.my_approved_ideas || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Assessments</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.my_projects || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.my_tasks || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.my_experiments || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* My Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.my_tasks_list?.length > 0 ? (
            <div className="space-y-3">
              {stats.my_tasks_list.map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Project: {task.research_project?.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {task.due_date && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
                    <Badge variant={task.priority === 'high' ? 'destructive' : 'outline'}>
                      {task.priority}
                    </Badge>
                    <Badge>{task.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No pending tasks</p>
          )}
        </CardContent>
      </Card>

      {/* My Ideas */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>My Research Ideas</CardTitle>
            <Button size="sm">Submit New Idea</Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats?.my_ideas_list?.length > 0 ? (
            <div className="space-y-3">
              {stats.my_ideas_list.map((idea: any) => (
                <div key={idea.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{idea.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {idea.summary}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      idea.status === 'approved' ? 'default' :
                      idea.status === 'rejected' ? 'destructive' :
                      idea.status === 'under_review' ? 'secondary' :
                      'outline'
                    }>
                      {idea.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">{idea.priority}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No ideas submitted yet</p>
          )}
        </CardContent>
      </Card>

      {/* Team Projects */}
      {stats?.team_projects?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Team Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.team_projects.map((project: any) => (
                <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{project.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Lead: {project.project_lead?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-medium">{project.progress_percentage}%</p>
                      <p className="text-xs text-muted-foreground">Progress</p>
                    </div>
                    <Badge variant="outline">{project.current_stage.replace('_', ' ')}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
