import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";
import { RoleManager } from "@/components/rbac/RoleManager";
import { PermissionManager } from "@/components/rbac/PermissionManager";
import { UserRoleAssignment } from "@/components/rbac/UserRoleAssignment";
import { RBACStats } from "@/components/rbac/RBACStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/rbac")({
  component: () => (
    <ProtectedRoute permission="manage_roles">
      <AppShell>
        <RBACManagementPage />
      </AppShell>
    </ProtectedRoute>
  ),
});

function RBACManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">RBAC Management</h1>
        <p className="text-muted-foreground">
          Manage roles, permissions, and user access control
        </p>
      </div>

      <RBACStats />

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="assignments">User Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <RoleManager />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <PermissionManager />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <UserRoleAssignment />
        </TabsContent>
      </Tabs>
    </div>
  );
}
