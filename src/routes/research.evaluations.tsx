import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getAuthToken } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const Route = createFileRoute("/research/evaluations")({
  component: () => (
    <RequireAuth>
      <ResearchEvaluationsPage />
    </RequireAuth>
  ),
});

function ResearchEvaluationsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: evaluations, isLoading } = useQuery({
    queryKey: ["research-evaluations", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/research-evaluations?${params}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      return response.json();
    },
  });

  const getTRLColor = (level: number) => {
    if (level >= 7) return "bg-green-500/10 text-green-700 border-green-500/20";
    if (level >= 4) return "bg-blue-500/10 text-blue-700 border-blue-500/20";
    return "bg-gray-500/10 text-gray-700 border-gray-500/20";
  };

  return (
    <AppShell>
      <PageHeader
        title="Research Evaluations"
        subtitle="Review project outcomes and technology readiness"
      />

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search evaluations by project title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Evaluations List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading evaluations...</div>
      ) : (
        <div className="grid gap-4">
          {evaluations?.data?.map((evaluation: any) => (
            <Card key={evaluation.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold">
                      {evaluation.research_project?.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Evaluated by {evaluation.evaluator?.name} • {new Date(evaluation.evaluation_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getTRLColor(evaluation.trl_level)}>
                    TRL {evaluation.trl_level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Performance Improvement</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <p className="text-lg font-semibold text-green-600">{evaluation.performance_improvement}%</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Benchmark Score</p>
                    <p className="text-lg font-semibold">{evaluation.benchmark_baseline}/100</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Research Status</p>
                    <Badge variant="outline">
                      {evaluation.research_project?.current_stage?.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                {evaluation.research_findings && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Key Findings</p>
                    <p className="text-sm line-clamp-2">{evaluation.research_findings}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate({ to: `/research/evaluations/${evaluation.id}` })}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {evaluations?.data?.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No evaluations found</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </AppShell>
  );
}
