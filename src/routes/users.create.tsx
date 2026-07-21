import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { CreateUserForm } from "@/components/users/CreateUserForm";
import { usersApi } from "@/lib/api/users";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/users/create")({
  head: () => ({ meta: [{ title: "Create User — STRP" }] }),
  component: () => (
    <RequireAuth>
      <PermissionGuard permission="create_users">
        <Page />
      </PermissionGuard>
    </RequireAuth>
  ),
});

function Page() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      toast.success("User created successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate({ to: "/users" });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to create user";
      const errors = error.response?.data?.errors;
      
      if (errors && Array.isArray(errors)) {
        errors.forEach((err: string) => toast.error(err));
      } else {
        toast.error(message);
      }
    },
  });

  return (
    <AppShell>
      <PageHeader
        title="Create New User"
        subtitle="Add a user within your management hierarchy"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/users" })}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Users
          </Button>
        }
      />

      <div className="max-w-4xl mx-auto">
        <CreateUserForm
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
          onCancel={() => navigate({ to: "/users" })}
        />
      </div>
    </AppShell>
  );
}
