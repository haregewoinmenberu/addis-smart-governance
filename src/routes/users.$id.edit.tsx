import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usersApi } from "@/lib/api/users";
import type { UpdateUserData } from "@/lib/api/users";
import { toast } from "sonner";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/users/$id/edit")({
  head: () => ({ meta: [{ title: "Edit User — STRP" }] }),
  component: () => (
    <RequireAuth>
      <PermissionGuard permission="edit_users">
        <Page />
      </PermissionGuard>
    </RequireAuth>
  ),
});

function Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => usersApi.get(parseInt(id)),
  });

  const { data: manageableRolesData } = useQuery({
    queryKey: ["users", "manageable-roles"],
    queryFn: () => usersApi.getManageableRoles(),
  });

  const [formData, setFormData] = useState<UpdateUserData>({
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    roles: [],
  });

  useEffect(() => {
    if (userData?.data) {
      const user = userData.data;
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        position: user.position || "",
        department: user.department || "",
        roles: user.roles?.map((r: any) => r.name) || [],
      });
    }
  }, [userData]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserData) => usersApi.update(parseInt(id), data),
    onSuccess: () => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      navigate({ to: "/users" });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to update user";
      const errors = error.response?.data?.errors;
      
      if (errors && Array.isArray(errors)) {
        errors.forEach((err: string) => toast.error(err));
      } else {
        toast.error(message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.roles && formData.roles.length === 0) {
      toast.error("Please select at least one role");
      return;
    }
    
    updateMutation.mutate(formData);
  };

  const handleRoleToggle = (roleName: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles?.includes(roleName)
        ? prev.roles.filter((r) => r !== roleName)
        : [...(prev.roles || []), roleName],
    }));
  };

  const manageableRoles = manageableRolesData?.data || [];
  const user = userData?.data;
  const canManage = user?.can_manage;

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!canManage) {
    return (
      <AppShell>
        <PageHeader
          title="Edit User"
          subtitle="Update user information"
          actions={
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/users" })}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Users
            </Button>
          }
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to manage this user. You can only manage users that are one level below your position in the organizational hierarchy.
          </AlertDescription>
        </Alert>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Edit User"
        subtitle={`Update ${user?.name}'s information`}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/users" })}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Users
          </Button>
        }
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Update user details and role assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+251911000000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Senior Officer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Department"
              />
            </div>

            <div className="space-y-2">
              <Label>Roles * (Select at least one)</Label>
              <div className="border rounded-md p-4 space-y-3 max-h-64 overflow-y-auto bg-muted/30">
                {manageableRoles.map((role) => (
                  <div key={role.id} className="flex items-start gap-3">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={formData.roles?.includes(role.name)}
                      onCheckedChange={() => handleRoleToggle(role.name)}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`role-${role.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {role.display_name}
                      </label>
                      {role.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {role.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                You can only assign roles within your management scope
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/users" })}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending || (formData.roles && formData.roles.length === 0)}
              >
                {updateMutation.isPending ? "Updating..." : "Update User"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
} 