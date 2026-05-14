import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useToast } from "@/hooks/use-toast";
import { getTechnology, updateTechnology } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/registry/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Technology — STRP" }] }),
  component: () => (
    <RequireAuth>
      <Page />
    </RequireAuth>
  ),
});

interface TechnologyFormData {
  name: string;
  category: string;
  description: string;
  vendor: string;
  version: string;
  status: string;
  deployment_type: string;
  owner: string;
  license_type: string;
}

function Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<TechnologyFormData>({
    name: "",
    category: "",
    description: "",
    vendor: "",
    version: "",
    status: "active",
    deployment_type: "Cloud",
    owner: "",
    license_type: "",
  });

  // Fetch technology data
  const { data: techData, isLoading } = useQuery({
    queryKey: ["technology", id],
    queryFn: () => getTechnology(id),
  });

  // Populate form when data is loaded
  useEffect(() => {
    if (techData?.data) {
      const tech = techData.data;
      setFormData({
        name: tech.name || "",
        category: tech.category || "",
        description: tech.description || "",
        vendor: tech.vendor || "",
        version: tech.version || "",
        status: tech.status || "active",
        deployment_type: tech.deployment_type || "Cloud",
        owner: tech.owner || "",
        license_type: tech.license_type || "",
      });
    }
  }, [techData]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateTechnology(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technologies"] });
      queryClient.invalidateQueries({ queryKey: ["technology", id] });
      toast({
        title: "Success",
        description: "Technology updated successfully",
      });
      navigate({ to: "/registry" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading technology...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Edit Technology"
        subtitle="Update technology asset information"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/registry" })}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Registry
          </Button>
        }
      />

      <Card className="rounded-2xl border-border/60 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="name">Technology Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Citizen ID Platform"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Identity Management"
                required
              />
            </div>

            <div>
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="e.g., Sheba Tech"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide a detailed description of the technology"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="e.g., 2.1.0"
              />
            </div>

            <div>
              <Label htmlFor="owner">Owner/Department</Label>
              <Input
                id="owner"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                placeholder="e.g., ITDB Central"
              />
            </div>

            <div>
              <Label htmlFor="deployment_type">Deployment Type *</Label>
              <Select
                value={formData.deployment_type}
                onValueChange={(value) => setFormData({ ...formData, deployment_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cloud">Cloud</SelectItem>
                  <SelectItem value="On-Prem">On-Premise</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="Edge">Edge</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="pilot">Pilot</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="license_type">License Type</Label>
              <Input
                id="license_type"
                value={formData.license_type}
                onChange={(e) => setFormData({ ...formData, license_type: e.target.value })}
                placeholder="e.g., Perpetual, SaaS, Subscription"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/registry" })}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Technology"}
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
