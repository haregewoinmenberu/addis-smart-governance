import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getAuthToken } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, Mail, Phone, Building2, UserCheck, 
  Briefcase, Calendar, Shield, ChevronRight, ClipboardList
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/research/team")({
  component: () => (
    <RequireAuth>
      <ResearchTeamPage />
    </RequireAuth>
  ),
});

function ResearchTeamPage() {
  const navigate = useNavigate();

  // Fetch assignable users (team members below in hierarchy)
  const { data: teamData, isLoading } = useQuery({
    queryKey: ["research-team-members"],
    queryFn: async () => {
      const res = await fetch(`/api/research-ideas/assignable-users`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch team");
      return res.json();
    },
  });

  // Fetch research ideas to show team workload
  const { data: ideasData } = useQuery({
    queryKey: ["research-ideas-all"],
    queryFn: async () => {
      const res = await fetch(`/api/research-ideas`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch ideas");
      return res.json();
    },
  });

  const teamMembers: any[] = teamData?.data ?? [];
  const allIdeas: any[] = ideasData?.data ?? [];

  // Calculate workload for each team member
  const getMemberWorkload = (memberId: number) => {
    return allIdeas.filter((idea: any) => {
      const assignedId = typeof idea.assigned_to_director === 'object' 
        ? idea.assigned_to_director?.id 
        : idea.assigned_to_director;
      return assignedId === memberId && ['submitted', 'under_review'].includes(idea.status);
    }).length;
  };

  return (
    <AppShell>
      <PageHeader
        title="Research Team"
        subtitle="Manage your research officers and coordinate team activities"
      />

      {/* Team Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tasks</p>
                <p className="text-2xl font-bold">
                  {allIdeas.filter((i: any) => ['submitted', 'under_review'].includes(i.status)).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {allIdeas.filter((i: any) => i.status === 'approved').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {allIdeas.filter((i: any) => i.status === 'draft').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Team Members
          </CardTitle>
          <CardDescription>
            Research officers reporting to you in the organizational hierarchy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-lg animate-pulse">
                  <div className="h-12 w-12 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold mb-2">No team members found</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Research officers will appear here once they are assigned to your team in the organizational hierarchy.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member: any) => {
                const workload = getMemberWorkload(member.id);
                const initials = member.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?';
                
                return (
                  <Card key={member.id} className="hover:shadow-md transition-all border-border/60">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <Avatar className="h-14 w-14">
                          <AvatarFallback className="bg-gradient-primary text-white text-lg font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>

                        {/* Member Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-base font-semibold truncate">{member.name}</h3>
                              <div className="flex items-center gap-2 flex-wrap mt-1">
                                {member.roles && member.roles.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    <Shield className="h-3 w-3 mr-1" />
                                    {member.roles[0].display_name}
                                  </Badge>
                                )}
                                {workload > 0 && (
                                  <Badge 
                                    variant={workload > 5 ? "destructive" : workload > 2 ? "secondary" : "default"}
                                    className="text-xs"
                                  >
                                    {workload} active {workload === 1 ? 'task' : 'tasks'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div className="space-y-1.5 text-sm text-muted-foreground">
                            {member.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{member.email}</span>
                              </div>
                            )}
                            {member.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 shrink-0" />
                                <span>{member.phone}</span>
                              </div>
                            )}
                            {member.department && (
                              <div className="flex items-center gap-2">
                                <Building2 className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{member.department}</span>
                              </div>
                            )}
                            {member.last_login_at && (
                              <div className="flex items-center gap-2 text-xs">
                                <Calendar className="h-3 w-3 shrink-0" />
                                <span>
                                  Last active: {new Date(member.last_login_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0"
                          onClick={() => navigate({ to: "/research/ideas/team-leader", search: { tab: "team" } })}
                        >
                          View Tasks
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => navigate({ to: "/research/ideas/team-leader" })}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Manage Research Ideas</h3>
                <p className="text-sm text-muted-foreground">
                  View and assign research tasks to team members
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => navigate({ to: "/requests/assigned" })}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Assigned Requests</h3>
                <p className="text-sm text-muted-foreground">
                  View service requests assigned to you
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
