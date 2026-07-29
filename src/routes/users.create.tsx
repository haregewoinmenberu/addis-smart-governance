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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/users/create")({
  head: () => ({ meta: [{ title: "Create User — STRP" }] }),
  component: () => (
    <RequireAuth>
      <PermissionGuard
        permission="create_users"
        fallback={
          <AppShell>
            <div className="container mx-auto p-6 max-w-2xl">
              <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                <CardHeader>
                  <CardTitle className="text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <AlertCircle className="h-6 w-6" />
                    Access Denied
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-amber-700 dark:text-amber-200">
                    You do not have permission to create users. Please contact your system administrator if you believe you should have access.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                    Go Back
                  </Button>
                </CardContent>
              </Card>
            </div>
          </AppShell>
        }
      >
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
