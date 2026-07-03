import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, UserPlus, Mail, Shield, Trash2, MoreVertical, Check, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getTeamMembers,
  inviteTeamMember,
  updateTeamMember,
  removeTeamMember,
  resendInvitation,
  type TeamMember,
} from "@/lib/api/institution-team";

interface TeamManagementProps {
  institutionId: number;
  institutionName: string;
}

export function TeamManagement({ institutionId, institutionName }: TeamManagementProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "manager" | "viewer" | "collaborator">("viewer");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const queryClient = useQueryClient();

  // Fetch team members
  const { data: teamData, isLoading } = useQuery({
    queryKey: ["team-members", institutionId, statusFilter, roleFilter, searchQuery],
    queryFn: () =>
      getTeamMembers(institutionId, {
        status: statusFilter !== "all" ? statusFilter : undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        search: searchQuery || undefined,
      }),
  });

  const members = teamData?.data?.data || [];

  // Invite mutation
  const inviteMutation = useMutation({
    mutationFn: () =>
      inviteTeamMember(institutionId, {
        email: inviteEmail,
        name: inviteName,
        role: inviteRole,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", institutionId] });
      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("viewer");
      toast({
        title: "Invitation sent",
        description: "Team member invitation has been sent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Invitation failed",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: number; role: string }) =>
      updateTeamMember(institutionId, memberId, { role: role as any }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", institutionId] });
      toast({
        title: "Role updated",
        description: "Team member role has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    },
  });

  // Remove member mutation
  const removeMutation = useMutation({
    mutationFn: (memberId: number) => removeTeamMember(institutionId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", institutionId] });
      toast({
        title: "Member removed",
        description: "Team member has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Remove failed",
        description: error.message || "Failed to remove member",
        variant: "destructive",
      });
    },
  });

  // Resend invitation mutation
  const resendMutation = useMutation({
    mutationFn: (memberId: number) => resendInvitation(institutionId, memberId),
    onSuccess: () => {
      toast({
        title: "Invitation resent",
        description: "Invitation has been resent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Resend failed",
        description: error.message || "Failed to resend invitation",
        variant: "destructive",
      });
    },
  });

  const roles = [
    {
      value: "admin",
      label: "Administrator",
      description: "Full access to all features and settings",
      permissions: ["Manage team", "Edit profile", "Submit requests", "View analytics", "Delete data"],
    },
    {
      value: "manager",
      label: "Manager",
      description: "Can submit requests and manage documents",
      permissions: ["Submit requests", "Upload documents", "View analytics", "Comment on requests"],
    },
    {
      value: "viewer",
      label: "Viewer",
      description: "Read-only access to requests and documents",
      permissions: ["View requests", "View documents", "View analytics"],
    },
    {
      value: "collaborator",
      label: "Collaborator",
      description: "Can comment and contribute but not submit",
      permissions: ["View requests", "Comment on requests", "Upload supporting documents"],
    },
  ];

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      manager: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      viewer: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      collaborator: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    };
    return colors[role as keyof typeof colors] || colors.viewer;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { variant: "default" as const, label: "Active" },
      invited: { variant: "secondary" as const, label: "Invited" },
      suspended: { variant: "destructive" as const, label: "Suspended" },
    };
    return config[status as keyof typeof config] || config.invited;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleInvite = () => {
    if (!inviteEmail || !inviteName) {
      toast({
        title: "Missing information",
        description: "Please provide both email and name",
        variant: "destructive",
      });
      return;
    }

    inviteMutation.mutate();
  };

  const handleRemoveMember = (member: TeamMember) => {
    if (confirm(`Remove ${member.name} from the team?`)) {
      removeMutation.mutate(member.id);
    }
  };

  const handleChangeRole = (memberId: number, newRole: string) => {
    updateRoleMutation.mutate({ memberId, role: newRole });
  };

  const handleResendInvitation = (memberId: number) => {
    resendMutation.mutate(memberId);
  };

  const selectedRoleInfo = roles.find((r) => r.value === inviteRole);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Management
              </CardTitle>
              <CardDescription>
                Manage team members and their access levels for {institutionName}
              </CardDescription>
            </div>
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your institution's team on STRP
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@institution.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">{role.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedRoleInfo && (
                    <div className="rounded-lg border p-4 bg-muted/50">
                      <h4 className="font-medium text-sm mb-2">{selectedRoleInfo.label} Permissions:</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {selectedRoleInfo.description}
                      </p>
                      <ul className="space-y-1">
                        {selectedRoleInfo.permissions.map((permission, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            {permission}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsInviteOpen(false)} disabled={inviteMutation.isPending}>
                    Cancel
                  </Button>
                  <Button onClick={handleInvite} disabled={inviteMutation.isPending}>
                    {inviteMutation.isPending ? (
                      "Sending..."
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="collaborator">Collaborator</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Team Members List */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">Loading team members...</p>
          </CardContent>
        </Card>
      ) : members.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No team members found</p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" || roleFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Invite your first team member to get started"}
            </p>
            <Button onClick={() => setIsInviteOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {members.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{member.name}</h4>
                        <Badge variant={getStatusBadge(member.status).variant}>
                          {getStatusBadge(member.status).label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {member.joined_at && (
                          <span>Joined {new Date(member.joined_at).toLocaleDateString()}</span>
                        )}
                        {member.invited_at && member.status === "invited" && (
                          <span>Invited {new Date(member.invited_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getRoleBadge(member.role)}>
                      <Shield className="h-3 w-3 mr-1" />
                      {member.role_label}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleChangeRole(member.id, "admin")}>
                          Change to Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeRole(member.id, "manager")}>
                          Change to Manager
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeRole(member.id, "collaborator")}>
                          Change to Collaborator
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeRole(member.id, "viewer")}>
                          Change to Viewer
                        </DropdownMenuItem>
                        {member.status === "invited" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleResendInvitation(member.id)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Resend Invitation
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleRemoveMember(member)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Role Permissions Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions Reference</CardTitle>
          <CardDescription>Understanding access levels and capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {roles.map((role) => (
              <div key={role.value} className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getRoleBadge(role.value)}>{role.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                <ul className="space-y-1">
                  {role.permissions.map((permission, index) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
