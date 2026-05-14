import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { getSubCity, updateSubCity } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/sub-cities/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Sub-City — STRP" }] }),
  component: () => (
    <RequireAuth>
      <PermissionGuard permission="edit_sub_cities">
        <Page />
      </PermissionGuard>
    </RequireAuth>
  ),
});

function Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: subCityData, isLoading } = useQuery({
    queryKey: ["sub-city", id],
    queryFn: () => getSubCity(id),
  });

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
  });

  useEffect(() => {
    if (subCityData?.data) {
      const sc = subCityData.data as any;
      setFormData({
        name: sc.name || "",
        code: sc.code || "",
        description: sc.description || "",
        address: sc.address || "",
        phone: sc.phone || "",
        email: sc.email || "",
        website: sc.website || "",
      });
    }
  }, [subCityData]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => updateSubCity(id, data),
    onSuccess: () => {
      toast.success("Sub-city updated successfully");
      queryClient.invalidateQueries({ queryKey: ["sub-cities"] });
      queryClient.invalidateQueries({ queryKey: ["sub-city", id] });
      navigate({ to: "/sub-cities/$id", params: { id } });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update sub-city");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Edit Sub-City"
        subtitle="Update sub-city organization details"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/sub-cities" })}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Sub-Cities
          </Button>
        }
      />

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Sub-City Information</CardTitle>
          <CardDescription>Update the organization details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
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

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/sub-cities" })}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update Sub-City"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
