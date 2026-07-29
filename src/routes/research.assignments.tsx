import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getAuthToken } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, Eye, User, Calendar, Target, 
  ClipboardList, ArrowRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { researchCategoryLabels } from "@/lib/research-schema";

export const Route = createFileRoute("/research/assignments")({
  component: () => (
    <RequireAuth>
      <ResearchAssignmentsPage />
    </RequireAuth>
  ),
});

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-500/10 text-gray-600 border-gray-400/30",
  submitted: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  under_review: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-700 border-green-500/20",
  rejected: "bg-red-500/10 text-red-700 border-red-500/20",
};

function ResearchAssignmentsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Fetch team members
  const { data: teamData } = useQuery({
    queryKey: ["research-team-members"],
    queryFn: async () => {
      const res = await fetch(`/api/research-ideas/assignable-users`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch team");
      return res.json();
    },
  });

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

  const teamMembers: any[] = teamData?.data ?? [];
  const allIdeas: any[] = ideasData?.data ?? [];

  // Group assignments by team member
  const assignmentsByMember: Record<number, any[]> = {};
  teamMembers.forEach((member) => {
    assignmentsByMember[member.id] = allIdeas.filter((idea) => {
      const assignedId = typeof idea.assigned_to_director === 'object' 
        ? idea.assigned_to_director?.id 
        : idea.assigned_to_director;
      return assignedId === member.id;
    });
  });

  return (
    <AppShell>
      <PageHeader
        title="Research Assignments"
        subtitle="Track research tasks assigned to your team members"
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by research title…"
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

      {/* Assignments by Member */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                <div className="h-4 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : teamMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ClipboardList className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-base font-semibold mb-1">No team members</h3>
            <p className="text-sm text-muted-foreground">
              Team members will appear here once added to your team
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {teamMembers.map((member: any) => {
            const assignments = assignmentsByMember[member.id] || [];
            const initials = member.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?';
            
            return (
              <Card key={member.id} className="border-border/60">
                <CardContent className="p-5">
                  {/* Member Header */}
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border/40">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-primary text-white font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {assignments.length} {assignments.length === 1 ? 'task' : 'tasks'}
                    </Badge>
                  </div>

                  {/* Assignments */}
                  {assignments.length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No assignments yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assignments.map((idea: any) => (
                        <div
                          key={idea.id}
                          className="p-3 rounded-lg border border-border/60 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold truncate">{idea.title}</h4>
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                                <User className="h-3 w-3" />
                                Submitted by {idea.submitter?.name ?? "Unknown"}
                                <span className="text-border">·</span>
                                <Calendar className="h-3 w-3" />
                                {new Date(idea.created_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                            <Badge className={`text-xs ${STATUS_STYLES[idea.status] ?? ""}`}>
                              {idea.status?.replace(/_/g, " ")}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <div className="flex gap-1.5 flex-wrap">
                              {idea.research_category && (
                                <Badge variant="outline" className="text-[11px]">
                                  {researchCategoryLabels[
                                    idea.research_category as keyof typeof researchCategoryLabels
                                  ] ?? idea.research_category}
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => navigate({ to: `/research/ideas/${idea.id}` })}
                            >
                              <Eye className="h-3 w-3 mr-1" /> View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Action */}
      <Card className="mt-6 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate({ to: "/research/ideas/team-leader" })}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Assign New Research</h3>
                <p className="text-xs text-muted-foreground">
                  Go to research ideas to assign tasks to team members
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
