import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { getAuthToken } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Eye, User, Calendar, Lightbulb, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { researchCategoryLabels } from "@/lib/research-schema";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/research/ideas/director")({
  component: () => (
    <RequireAuth>
      <ResearchDirectorIdeasPage />
    </RequireAuth>
  ),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: (search.tab as string) || "assigned",
    };
  },
});

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-500/10 text-gray-600 border-gray-400/30",
  submitted: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  under_review: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-700 border-green-500/20",
  rejected: "bg-red-500/10 text-red-700 border-red-500/20",
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-slate-100 text-slate-600 border-slate-200",
  medium: "bg-blue-100 text-blue-600 border-blue-200",
  high: "bg-orange-100 text-orange-600 border-orange-200",
  critical: "bg-red-100 text-red-600 border-red-200",
};

function ResearchDirectorIdeasPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/research/ideas/director" });
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Fetch all research ideas
  const { data: ideasData, isLoading } = useQuery({
    queryKey: ["research-ideas", searchQuery, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filterStatus) params.append("status", filterStatus);
      const res = await fetch(`/api/research-ideas?${params}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch ideas");
      return res.json();
    },
  });

  const allIdeas: any[] = ideasData?.data ?? [];

  // Filter ideas based on tabs
  const assignedIdeas = allIdeas.filter((idea) => {
    // Handle both object and number for assigned_to_director
    const assignedId = typeof idea.assigned_to_director === 'object' 
      ? idea.assigned_to_director?.id 
      : idea.assigned_to_director;
    return assignedId === user?.id;
  });
  
  const myIdeas = allIdeas.filter((idea) => {
    // Handle both object and number for submitted_by
    const submitterId = typeof idea.submitter === 'object'
      ? idea.submitter?.id
      : idea.submitted_by;
    return submitterId === user?.id;
  });

  const handleTabChange = (value: string) => {
    navigate({
      to: "/research/ideas/director",
      search: { tab: value },
    });
  };

  const renderIdeaCard = (idea: any) => (
    <Card key={idea.id} className="hover:shadow-md transition-all border-border/60">
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold truncate mb-1">{idea.title}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
              <User className="h-3 w-3" />
              {idea.submitter?.name ?? "Unknown"}
              <span className="text-border">·</span>
              <Calendar className="h-3 w-3" />
              {new Date(idea.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
            <Badge className={`text-xs ${STATUS_STYLES[idea.status] ?? ""}`}>
              {idea.status?.replace(/_/g, " ")}
            </Badge>
            <Badge className={`text-xs ${PRIORITY_STYLES[idea.priority] ?? ""}`}>
              {idea.priority}
            </Badge>
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {idea.summary}
        </p>

        <div className="flex justify-between items-center gap-2">
          <div className="flex gap-1.5 flex-wrap">
            {idea.research_category && (
              <Badge variant="outline" className="text-[11px]">
                {researchCategoryLabels[
                  idea.research_category as keyof typeof researchCategoryLabels
                ] ?? idea.research_category}
              </Badge>
            )}
            {idea.government_sector && (
              <Badge variant="outline" className="text-[11px]">
                {idea.government_sector}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => navigate({ to: `/research/ideas/${idea.id}/director` })}
          >
            <Eye className="h-3 w-3 mr-1" /> View
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppShell>
      <PageHeader
        title="My Research Ideas"
        subtitle="Manage ideas assigned to you and ideas you've created"
        actions={
          <Button
            size="sm"
            className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow"
            onClick={() => navigate({ to: "/research/ideas/create" })}
          >
            <Plus className="h-4 w-4" />
            Submit New Idea
          </Button>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or summary…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background text-sm min-w-[150px]"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={search.tab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="assigned" className="gap-2">
            <Target className="h-4 w-4" />
            Assigned Ideas
            {assignedIdeas.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {assignedIdeas.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="created" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            My Ideas
            {myIdeas.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {myIdeas.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                    <div className="h-3 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : assignedIdeas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-base font-semibold mb-1">
                  No assigned ideas yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ideas assigned to you from Smart City Command Center will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            assignedIdeas.map(renderIdeaCard)
          )}
        </TabsContent>

        <TabsContent value="created" className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                    <div className="h-3 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : myIdeas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Lightbulb className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-base font-semibold mb-1">
                  No ideas created yet
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                  Submit your first research idea to get started
                </p>
                <Button onClick={() => navigate({ to: "/research/ideas/create" })}>
                  <Plus className="h-4 w-4 mr-2" /> Submit Your First Idea
                </Button>
              </CardContent>
            </Card>
          ) : (
            myIdeas.map(renderIdeaCard)
          )}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
