import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const Route = createFileRoute("/research/screenings")({
  component: () => (
    <RequireAuth>
      <ResearchScreeningsPage />
    </RequireAuth>
  ),
});

function ResearchScreeningsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: screenings, isLoading } = useQuery({
    queryKey: ["research-screenings", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/research-screenings?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.json();
    },
  });

  const getDecisionColor = (decision: string) => {
    const colors: Record<string, string> = {
      approved: "bg-green-500/10 text-green-700 border-green-500/20",
      rejected: "bg-red-500/10 text-red-700 border-red-500/20",
      revision_requested: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
    };
    return colors[decision] || "bg-gray-500/10 text-gray-700";
  };

  return (
    <AppShell>
      <PageHeader
        title="Research Screenings"
        subtitle="Review and evaluate research ideas for approval"
      />

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search screenings by idea title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Screenings List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading screenings...</div>
      ) : (
        <div className="grid gap-4">
          {screenings?.data?.map((screening: any) => (
            <Card key={screening.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold">
                      {screening.research_idea?.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Screened by {screening.screener?.name} • {new Date(screening.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getDecisionColor(screening.decision)}>
                    {screening.decision?.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Score</p>
                    <p className="text-2xl font-bold text-primary">{screening.total_score}/60</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Strategic Alignment</p>
                    <p className="text-lg font-semibold">{screening.strategic_alignment_score}/10</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Feasibility</p>
                    <p className="text-lg font-semibold">{screening.feasibility_score}/10</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Governance Impact</p>
                    <p className="text-lg font-semibold">{screening.governance_impact_score}/10</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Innovation Level</p>
                    <p className="text-lg font-semibold">{screening.innovation_level_score}/10</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Risk Level</p>
                    <p className="text-lg font-semibold">{screening.risk_level_score}/10</p>
                  </div>
                </div>
                
                {screening.overall_comment && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Overall Comment</p>
                    <p className="text-sm line-clamp-2">{screening.overall_comment}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate({ to: `/research/ideas/${screening.research_idea_id}` })}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View Idea
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate({ to: `/research/screenings/${screening.id}` })}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {screenings?.data?.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No screenings found</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </AppShell>
  );
}
