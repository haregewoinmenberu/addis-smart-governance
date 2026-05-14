import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { createSubCity } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/sub-cities/create")({
  head: () => ({ meta: [{ title: "Register Sub-City — STRP" }] }),
  component: () => (
    <RequireAuth>
      <PermissionGuard permission="create_sub_cities">
        <Page />
      </PermissionGuard>
    </RequireAuth>
  ),
});

function Page() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    admin_name: "",
    admin_email: "",
    admin_phone: "",
    admin_password: "",
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => createSubCity(data),
    onSuccess: () => {
      toast.success("Sub-city registered successfully");
      queryClient.invalidateQueries({ queryKey: ["sub-cities"] });
      navigate({ to: "/sub-cities" });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to register sub-city");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <AppShell>
      <PageHeader
        title="Register New Sub-City"
        subtitle="Register a new sub-city organization with an administrator account"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/sub-cities" })}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Sub-Cities
          </Button>
        }
      />

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Sub-City Registration</CardTitle>
          <CardDescription>Enter organization details and create an administrator account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Organization Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Bole Sub-City"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., BOLE"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the sub-city"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Physical address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+251111000000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@subcity.gov.et"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://subcity.gov.et"
                />
              </div>
            </div>

            {/* Administrator Account */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Administrator Account</h3>
              
              <div className="space-y-2">
                <Label htmlFor="admin_name">Full Name *</Label>
                <Input
                  id="admin_name"
                  value={formData.admin_name}
                  onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                  placeholder="Administrator full name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin_email">Email *</Label>
                  <Input
                    id="admin_email"
                    type="email"
                    value={formData.admin_email}
                    onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                    placeholder="admin@subcity.gov.et"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_phone">Phone</Label>
                  <Input
                    id="admin_phone"
                    value={formData.admin_phone}
                    onChange={(e) => setFormData({ ...formData, admin_phone: e.target.value })}
                    placeholder="+251911000000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin_password">Password *</Label>
                <Input
                  id="admin_password"
                  type="password"
                  value={formData.admin_password}
                  onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/sub-cities" })}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Registering..." : "Register Sub-City"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
