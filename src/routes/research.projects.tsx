import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getAuthToken } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, Calendar, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { stageLabels } from "@/lib/research-schema";

export const Route = createFileRoute("/research/projects")({
  component: () => (
    <RequireAuth>
      <ResearchProjectsPage />
    </RequireAuth>
  ),
});

function ResearchProjectsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["research-projects", search, filterStage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterStage) params.append('current_stage', filterStage);
      
      const response = await fetch(`/api/research-projects?${params}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
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

  return (
    <AppShell>
      <PageHeader
        title="Research Projects"
        subtitle="Manage active research projects and proposals"
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background text-sm"
            >
              <option value="">All Stages</option>
              {Object.entries(stageLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading projects...</div>
      ) : (
        <div className="grid gap-4">
          {projects?.data?.map((project: any) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold">{project.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Lead: {project.project_lead?.name || 'Not assigned'} • Created {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStageColor(project.current_stage)}>
                    {stageLabels[project.current_stage as keyof typeof stageLabels]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {project.background}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="font-semibold">{new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(project.estimated_budget)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Start</p>
                      <p className="font-semibold">{new Date(project.start_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">End</p>
                      <p className="font-semibold">{new Date(project.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {project.progress_percentage !== null && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Progress</p>
                        <p className="font-semibold">{project.progress_percentage}%</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate({ to: `/research/projects/${project.id}` })}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {projects?.data?.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No research projects found</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </AppShell>
  );
}
