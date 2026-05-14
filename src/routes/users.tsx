import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { getAuthToken } from "@/lib/api";
import { Users, ShieldCheck, KeyRound, Plus, Search, Check, X, Edit, Trash2, MoreVertical, UserX, UserCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, createUser, updateUser, deleteUser, toggleUserActive, resetUserPassword } from "@/lib/api";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export const Route = createFileRoute("/users")({
  head: () => ({ meta: [{ title: "User Management & RBAC — STRP" }] }),
  beforeLoad: async () => {
    const token = getAuthToken();
    if (!token) {
      throw redirect({ to: "/login", search: { redirect: "/users" } });
    }
  },
  component: Page,
});

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  department: string;
  password?: string;
  role_ids?: number[];
}

function Page() {
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    phone: "",
    department: "",
    password: "",
  });

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users", searchQuery],
    queryFn: () => getUsers({ search: searchQuery }),
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsCreateOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "User created successfully",
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

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserFormData }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsEditOpen(false);
      setSelectedUser(null);
      resetForm();
      toast({
        title: "Success",
        description: "User updated successfully",
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

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "",
      password: "",
    });
  };

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      department: user.department || "",
    });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (selectedUser) {
      updateMutation.mutate({ id: selectedUser.id, data: formData });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (id: number) => {
    toggleActiveMutation.mutate(id);
  };

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
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow">
                  <Plus className="h-4 w-4" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>Add a new user to the system</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+251911000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="IT Department"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-department">Department</Label>
              <Input
                id="edit-department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
