import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { getAuthToken } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Eye, User, Calendar, Lightbulb, Target, Users, UserPlus, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { researchCategoryLabels } from "@/lib/research-schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const Route = createFileRoute("/research/ideas/team-leader")({
  component: () => (
    <RequireAuth>
      <ResearchTeamLeaderIdeasPage />
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

function ResearchTeamLeaderIdeasPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/research/ideas/team-leader" });
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [assignTarget, setAssignTarget] = useState<any | null>(null);
  const [assignUserId, setAssignUserId] = useState("");
  const [assignNote, setAssignNote] = useState("");

  // Fetch research assigned to this team leader via assignments table
  const { data: ideasData, isLoading } = useQuery({
    queryKey: ["team-leader-assigned-research", searchQuery, filterStatus],
    queryFn: async () => {
      const res = await fetch(`/api/research-team-leader/assigned-research`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch assigned research");
      const data = await res.json();
      
      // Extract research ideas from assignments and apply filters
      let ideas = (data.data || [])
        .map((assignment: any) => {
          // Get the research idea from the assignment
          const idea = assignment.research_idea || assignment.researchIdea;
          if (!idea) return null;
          
          // Add assignment metadata to the idea for display
          return {
            ...idea,
            assignment_id: assignment.id,
            assignment_status: assignment.status,
            assignment_notes: assignment.assignment_notes,
            assigned_by_user: assignment.assigned_by,
            assigned_date: assignment.assigned_date,
          };
        })
        .filter(Boolean);
      
      if (searchQuery) {
        ideas = ideas.filter((idea: any) => 
          idea.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          idea.summary?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      if (filterStatus) {
        ideas = ideas.filter((idea: any) => idea.status === filterStatus);
      }
      
      return { data: ideas };
    },
  });

  // Fetch team members (officers) under this team leader's hierarchy
  const { data: teamData } = useQuery({
    queryKey: ["team-leader-officers"],
    queryFn: async () => {
      const res = await fetch(`/api/research-team-leader/team-members`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch team members");
      return res.json();
    },
  });

  const allIdeas: any[] = ideasData?.data ?? [];
  const teamMembers: any[] = teamData?.data ?? [];

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: async ({ id, userId, note }: { id: number; userId: string; note: string }) => {
      const res = await fetch(`/api/research-ideas/${id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ assigned_to: Number(userId), notes: note }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Assignment failed");
      return json;
    },
    onSuccess: () => {
      toast({ title: "✅ Assigned", description: "Research idea assigned successfully." });
      queryClient.invalidateQueries({ queryKey: ["research-ideas"] });
      setAssignTarget(null);
      setAssignUserId("");
      setAssignNote("");
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // Backend already filters - all ideas returned are assigned to this team leader
  const assignedIdeas = allIdeas;

  const handleTabChange = (value: string) => {
    navigate({
      to: "/research/ideas/team-leader",
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
            {idea.assigned_to_director && idea.assigned_to_director !== user?.id && (
              <Badge variant="outline" className="text-[11px] text-blue-700 border-blue-200">
                <User className="h-3 w-3 mr-1" />
                {typeof idea.assigned_to_director === 'object' 
                  ? idea.assigned_to_director?.name || 'Unknown User'
                  : idea.assignedToDirector?.name || `User #${idea.assigned_to_director}`}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => navigate({ to: `/research/ideas/${idea.id}/workspace`, search: { tab: 'overview' } })}
          >
            <Eye className="h-3 w-3 mr-1" /> View
          </Button>
          {teamMembers.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-blue-600 hover:bg-blue-50"
              onClick={() => {
                setAssignTarget(idea);
                setAssignUserId(String(idea.assigned_to_director ?? ""));
                setAssignNote("");
              }}
            >
              <UserPlus className="h-3 w-3 mr-1" /> Assign
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppShell>
      <PageHeader
        title="Research Team - Ideas"
        subtitle="Manage research ideas assigned to you by Research Director"
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
            Assigned Research
            {assignedIdeas.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {assignedIdeas.length}
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
                  No assigned research yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Research assigned to you by Research Director will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            assignedIdeas.map(renderIdeaCard)
          )}
        </TabsContent>
      </Tabs>

      {/* Assign Dialog */}
      <Dialog open={!!assignTarget} onOpenChange={(o) => !o && setAssignTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> Assign to Team Member
            </DialogTitle>
            <DialogDescription>
              Assign <span className="font-mono font-bold text-foreground">{assignTarget?.title}</span> to a research officer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-semibold block mb-1.5">
                Assign To <span className="text-red-500">*</span>
              </label>
              <Select value={assignUserId} onValueChange={setAssignUserId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select a research officer" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member: any) => (
                    <SelectItem key={member.id} value={String(member.id)}>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                          {member.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm">{member.name}</span>
                          <span className="text-xs text-muted-foreground">{member.email}</span>
                          {member.roles && member.roles.length > 0 && (
                            <span className="text-[10px] text-blue-600">
                              {member.roles[0].display_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {teamMembers.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Showing {teamMembers.length} research officer(s) in your team
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5">
                Note <span className="text-xs font-normal text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                placeholder="Assignment instructions or context…"
                rows={3}
                value={assignNote}
                onChange={(e) => setAssignNote(e.target.value)}
                className="resize-none text-sm"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <Button
                className="flex-1 bg-gradient-primary text-primary-foreground"
                disabled={!assignUserId || assignMutation.isPending}
                onClick={() => assignTarget && assignMutation.mutate({ id: assignTarget.id, userId: assignUserId, note: assignNote })}
              >
                {assignMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assigning…
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                disabled={assignMutation.isPending}
                onClick={() => setAssignTarget(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
