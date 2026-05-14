import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { createVendor } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/vendors/create")({
  head: () => ({ meta: [{ title: "Onboard Vendor — STRP" }] }),
  component: () => (
    <RequireAuth>
      <Page />
    </RequireAuth>
  ),
});

function Page() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    status: "Active",
    score: 0,
    active_projects: 0,
    sla_breaches: 0,
    last_reviewed_at: new Date().toISOString().split('T')[0],
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => createVendor(data),
    onSuccess: () => {
      toast.success("Vendor onboarded successfully");
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      navigate({ to: "/vendors" });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to onboard vendor");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <AppShell>
      <PageHeader
        title="Onboard New Vendor"
        subtitle="Register a new technology vendor in the system"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/vendors" })}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Vendors
          </Button>
        }
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Vendor Information</CardTitle>
          <CardDescription>Enter the details of the new vendor</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Vendor Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Sheba Tech PLC"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Preferred">Preferred</SelectItem>
                  <SelectItem value="Watchlist">Watchlist</SelectItem>
                  <SelectItem value="At risk">At Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="score">Performance Score (0-100)</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="active_projects">Active Projects</Label>
                <Input
                  id="active_projects"
                  type="number"
                  min="0"
                  value={formData.active_projects}
                  onChange={(e) => setFormData({ ...formData, active_projects: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sla_breaches">SLA Breaches</Label>
                <Input
                  id="sla_breaches"
                  type="number"
                  min="0"
                  value={formData.sla_breaches}
                  onChange={(e) => setFormData({ ...formData, sla_breaches: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_reviewed_at">Last Reviewed</Label>
                <Input
                  id="last_reviewed_at"
                  type="date"
                  value={formData.last_reviewed_at}
                  onChange={(e) => setFormData({ ...formData, last_reviewed_at: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/vendors" })}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Onboarding..." : "Onboard Vendor"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
