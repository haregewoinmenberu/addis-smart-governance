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
import { Users, ShieldCheck, KeyRound, Plus, Search, Edit, Trash2, MoreVertical, UserX, UserCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, deleteUser, toggleUserActive } from "@/lib/api";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/users/")({
  head: () => ({ meta: [{ title: "User Management & RBAC — STRP" }] }),
  component: Page,
});

function Page() {
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    action: "toggle" | "delete" | null;
    target: any | null;
  }>({ isOpen: false, action: null, target: null });

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users", searchQuery],
    queryFn: () => getUsers({ search: searchQuery }),
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: toggleUserActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openConfirm = (action: "toggle" | "delete", target: any) => {
    setConfirmState({ isOpen: true, action, target });
  };

  const closeConfirm = () => {
    setConfirmState({ isOpen: false, action: null, target: null });
  };

  const handleConfirm = () => {
    if (!confirmState.target || !confirmState.action) return;
    if (confirmState.action === "toggle") {
      toggleActiveMutation.mutate(confirmState.target.id);
    }
    if (confirmState.action === "delete") {
      deleteMutation.mutate(confirmState.target.id);
    }
    closeConfirm();
  };

  const confirmTitle =
    confirmState.action === "delete"
      ? "Delete user?"
      : confirmState.target?.is_active
        ? "Deactivate user?"
        : "Activate user?";

  const confirmMessage =
    confirmState.action === "delete"
      ? "This action cannot be undone."
      : "This will update the user status immediately.";

  const users = usersData?.data || [];
  const totalUsers = usersData?.total || 0;
  const activeUsers = users.filter((u: any) => u.is_active).length;

  return (
    <AppShell>
      <PageHeader
        title="User Management & RBAC"
        subtitle="Role-based access for ITDB Administrators, Sub-City Administrators, and Auditors."
        actions={
          <PermissionGuard permission="create_users">
            <Link to="/users/create">
              <Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow">
                <Plus className="h-4 w-4" />
                Create User
              </Button>
            </Link>
          </PermissionGuard>
        }
      />

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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">User</th>
                <th className="text-left font-medium px-4 py-3">Roles</th>
                <th className="text-left font-medium px-4 py-3">Department</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-right font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user.id} className="border-t border-border/60 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                          {user.name.split(" ").map((x: string) => x[0]).join("").toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role: any) => (
                          <Badge key={role.id} variant="secondary" className="text-xs">
                            {role.display_name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.department || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={
                          user.is_active
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        }
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
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
                            <DropdownMenuItem onClick={() => openConfirm("toggle", user)}>
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
                              onClick={() => openConfirm("delete", user)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </PermissionGuard>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <AlertDialog open={confirmState.isOpen} onOpenChange={(open) => { if (!open) closeConfirm(); }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{confirmMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeConfirm}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              className={confirmState.action === "delete" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
