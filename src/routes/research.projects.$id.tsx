import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, DollarSign, Target, TrendingUp } from "lucide-react";
import { stageLabels } from "@/lib/research-schema";

export const Route = createFileRoute("/research/projects/$id")({
  component: () => (
    <RequireAuth>
      <ProjectDetailPage />
    </RequireAuth>
  ),
});

function ProjectDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { data: project, isLoading } = useQuery({
    queryKey: ["research-project", id],
    queryFn: async () => {
      const response = await fetch(`/api/research-projects/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch project');
      return response.json();
    },
  });

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      idea_identification: "bg-gray-500/10 text-gray-700 border-gray-500/20",
      screening: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      proposal_development: "bg-purple-500/10 text-purple-700 border-purple-500/20",
      approval: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      execution: "bg-green-500/10 text-green-700 border-green-500/20",
      evaluation: "bg-orange-500/10 text-orange-700 border-orange-500/20",
      technology_transfer: "bg-teal-500/10 text-teal-700 border-teal-500/20",
    };
    return colors[stage] || "bg-gray-500/10 text-gray-700";
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="text-center py-12 text-muted-foreground">Loading project details...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={project?.data?.title || "Project Details"}
        subtitle={`Project Code: ${project?.data?.project_code || 'N/A'}`}
        actions={
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate({ to: '/research/projects' })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Current Stage</p>
                  <Badge className={getStageColor(project?.data?.current_stage)}>
                    {stageLabels[project?.data?.current_stage as keyof typeof stageLabels]}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold">{project?.data?.progress_percentage || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="text-lg font-bold">
                    {new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', notation: 'compact' }).format(project?.data?.estimated_budget || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-sm font-semibold">
                    {new Date(project?.data?.start_date).toLocaleDateString()} - {new Date(project?.data?.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Charter */}
        <Card>
          <CardHeader>
            <CardTitle>Project Charter</CardTitle>
            <CardDescription>Core project information and scope</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Background</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{project?.data?.background}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Project Objectives</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{project?.data?.objectives}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Project Lead</p>
              <p className="font-medium">{project?.data?.project_lead?.name || 'Not assigned'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Methodology & Deliverables */}
        <Card>
          <CardHeader>
            <CardTitle>Methodology & Deliverables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Research Methodology</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{project?.data?.methodology}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Expected Deliverables</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{project?.data?.expected_deliverables}</p>
            </div>
          </CardContent>
        </Card>

        {/* Resources & Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Resources & Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Estimated Budget</p>
                <p className="text-lg font-semibold">
                  {new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(project?.data?.estimated_budget || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Timeline</p>
                <p className="font-medium">
                  {new Date(project?.data?.start_date).toLocaleDateString()} to {new Date(project?.data?.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Required Resources</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{project?.data?.required_resources}</p>
            </div>
          </CardContent>
        </Card>

        {/* Risk & Success Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{project?.data?.risk_analysis}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Success Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{project?.data?.success_metrics}</p>
            </CardContent>
          </Card>
        </div>

        {/* TRL Information */}
        {project?.data?.trl_level && (
          <Card>
            <CardHeader>
              <CardTitle>Technology Readiness Level (TRL)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  TRL {project?.data?.trl_level}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {project?.data?.trl_level >= 7 ? 'Technology ready for deployment' : 
                   project?.data?.trl_level >= 4 ? 'Technology validated in lab environment' : 
                   'Early stage research and development'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
