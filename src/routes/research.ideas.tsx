import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const Route = createFileRoute("/research/ideas")({
  component: () => (
    <RequireAuth>
      <ResearchIdeasPage />
    </RequireAuth>
  ),
});

function ResearchIdeasPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const { data: ideas, isLoading } = useQuery({
    queryKey: ["research-ideas", search, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterStatus) params.append('status', filterStatus);
      
      const response = await fetch(`/api/research-ideas?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.json();
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-500/10 text-gray-700 border-gray-500/20",
      submitted: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      under_review: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      approved: "bg-green-500/10 text-green-700 border-green-500/20",
      rejected: "bg-red-500/10 text-red-700 border-red-500/20",
    };
    return colors[status] || "bg-gray-500/10 text-gray-700";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-gray-400/10 text-gray-600 border-gray-400/20",
      medium: "bg-blue-400/10 text-blue-600 border-blue-400/20",
      high: "bg-orange-400/10 text-orange-600 border-orange-400/20",
      critical: "bg-red-500/10 text-red-600 border-red-500/20",
    };
    return colors[priority] || "bg-gray-400/10 text-gray-600";
  };

  return (
    <AppShell>
      <PageHeader
        title="Research Ideas"
        subtitle="Submit and manage research proposals and innovation ideas"
        actions={
          <Button 
            size="sm" 
            className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow"
            onClick={() => navigate({ to: '/research/ideas/create' })}
          >
            <Plus className="h-4 w-4" />
            Submit New Idea
          </Button>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ideas by title or summary..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background text-sm"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Ideas List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading ideas...</div>
      ) : (
        <div className="grid gap-4">
          {ideas?.data?.map((idea: any) => (
            <Card key={idea.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold">{idea.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Submitted by {idea.submitter?.name} • {new Date(idea.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(idea.status)}>
                      {idea.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(idea.priority)}>
                      {idea.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {idea.summary}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {idea.research_category?.replace('_', ' ')}
                    </Badge>
                    {idea.government_sector && (
                      <Badge variant="outline" className="text-xs">
                        {idea.government_sector}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate({ to: `/research/ideas/${idea.id}` })}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {idea.status === 'draft' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate({ to: `/research/ideas/${idea.id}/edit` })}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {ideas?.data?.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No research ideas found</p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate({ to: '/research/ideas/create' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Your First Idea
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </AppShell>
  );
}
