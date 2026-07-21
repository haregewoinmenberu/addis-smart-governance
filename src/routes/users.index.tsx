import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { Users, ShieldCheck, KeyRound, Plus, Search, Edit, Trash2, MoreVertical, UserX, UserCheck, Building2, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/users";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Route = createFileRoute("/users/")({
  head: () => ({ meta: [{ title: "User Management & RBAC — STRP" }] }),
  component: Page,
});

function Page() {
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch users with hierarchy filtering
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users", searchQuery],
    queryFn: () => usersApi.list({ search: searchQuery || undefined }),
  });

  // Fetch hierarchy info
  const { data: hierarchyInfo } = useQuery({
    queryKey: ["users", "hierarchy-info"],
    queryFn: () => usersApi.getHierarchyInfo(),
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: usersApi.toggleActive,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (id: number) => {
    toggleActiveMutation.mutate(id);
  };

  const users = usersData?.data || [];
  const canCreateUsers = usersData?.meta?.can_create_users || false;
  const manageableRoles = usersData?.meta?.manageable_roles || [];
  const totalUsers = users.length;
  const activeUsers = users.filter((u: any) => u.is_active).length;

  // Only show Add User button if user has manageable roles
  const showAddUserButton = canCreateUsers && manageableRoles.length > 0;

  return (
    <AppShell>
      <PageHeader
        title="User Management"
        subtitle="Manage users within your organizational hierarchy"
        actions={
          showAddUserButton && (
            <Link to="/users/create">
              <Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow">
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </Link>
          )
        }
      />

      {/* Hierarchy Info Alert */}
      {hierarchyInfo && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex flex-col gap-1">
              <div className="font-medium">Your Management Scope</div>
              <div className="text-sm text-muted-foreground">
                Department: {hierarchyInfo.user.department || "Not assigned"} • 
                Can manage: {hierarchyInfo.capabilities.can_manage_count} user(s)
                {manageableRoles.length > 0 && (
                  <span> • Manageable roles: {manageableRoles.join(", ").replace(/_/g, " ")}</span>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total users" value={totalUsers.toString()} icon={Users} accent="primary" />
        <StatCard label="Active users" value={activeUsers.toString()} icon={ShieldCheck} accent="success" />
        <StatCard label="Inactive" value={(totalUsers - activeUsers).toString()} icon={UserX} accent="warning" />
        <StatCard label="Roles" value="3" icon={KeyRound} accent="info" />
      </div>

      <Card className="rounded-2xl border-border/60 overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <h3 className="font-semibold tracking-tight">Users</h3>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users…"
              className="pl-9 bg-muted/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="border border-border/40 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f8fafc] border-b border-border/40 text-[11px] uppercase tracking-wider font-semibold text-[#718096]">
                <tr>
                  <th className="text-left py-3.5 px-6 font-semibold">User</th>
                  <th className="text-left py-3.5 px-6 font-semibold">Roles</th>
                  <th className="text-left py-3.5 px-6 font-semibold">Department</th>
                  <th className="text-left py-3.5 px-6 font-semibold">Status</th>
                  <th className="text-right py-3.5 px-6 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user: any, rowIndex: number) => (
                    <tr key={user.id} className={`border-b border-border/40 hover:bg-slate-50/50 transition-colors ${
                      rowIndex % 2 === 0 ? "bg-white" : "bg-[#f8fafc]/30"
                    }`}>
                      <td className="px-6 py-4 text-sm text-[#4a5568]">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                            {user.name.split(" ").map((x: string) => x[0]).join("").toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-[#1a202c]">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                            {user.position && (
                              <p className="text-xs text-muted-foreground">{user.position}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#4a5568]">
                        <div className="flex flex-wrap gap-1">
                          {user.roles?.map((role: any) => (
                            <Badge key={role.id} variant="secondary" className="text-xs">
                              {role.display_name}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#4a5568]">
                        <div>
                          {user.department || "—"}
                          {user.institution && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Building2 className="h-3 w-3" />
                              {user.institution.name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#4a5568]">
                        <Badge
                          variant="secondary"
                          className={
                            user.is_active
                              ? "bg-success/10 text-success border-success/20 animate-none"
                              : "bg-destructive/10 text-destructive border-destructive/20 animate-none"
                          }
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                      {user.can_manage ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <PermissionGuard permission="edit_users">
                              <Link to={`/users/${user.id}/edit`}>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              </Link>
                            </PermissionGuard>
                            <PermissionGuard permission="edit_users">
                              <DropdownMenuItem onClick={() => handleToggleActive(user.id)}>
                                {user.is_active ? (
                                  <>
                                    <UserX className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                            </PermissionGuard>
                            <PermissionGuard permission="delete_users">
                              <DropdownMenuItem
                                onClick={() => handleDelete(user.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </PermissionGuard>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-xs text-muted-foreground">No access</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
    </AppShell>
  );
}
