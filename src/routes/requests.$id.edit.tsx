import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useToast } from "@/hooks/use-toast";
import { getRequest, updateRequest } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/requests/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Request — STRP" }] }),
  component: () => (
    <RequireAuth>
      <Page />
    </RequireAuth>
  ),
});

interface RequestFormData {
  title: string;
  description: string;
  office: string;
  budget: string;
  justification: string;
  expected_outcomes: string;
}

function Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<RequestFormData>({
    title: "",
    description: "",
    office: "",
    budget: "",
    justification: "",
    expected_outcomes: "",
  });

  // Fetch request data
  const { data: requestData, isLoading } = useQuery({
    queryKey: ["request", id],
    queryFn: () => getRequest(id),
  });

  // Populate form when data is loaded
  useEffect(() => {
    if (requestData?.data) {
      const request = requestData.data;
      setFormData({
        title: request.title || "",
        description: request.description || "",
        office: request.office || "",
        budget: request.budget?.toString() || "",
        justification: request.justification || "",
        expected_outcomes: request.expected_outcomes || "",
      });
    }
  }, [requestData]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      toast({
        title: "Success",
        description: "Request updated successfully",
      });
      navigate({ to: "/requests" });
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
    updateMutation.mutate({
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : null,
    });
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading request...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Edit Request"
        subtitle="Update request information"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/requests" })}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Requests
          </Button>
        }
      />

      <Card className="rounded-2xl border-border/60 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="title">Request Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., New Server Infrastructure"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide a detailed description of the technology request"
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="office">Office/Department *</Label>
              <Input
                id="office"
                value={formData.office}
                onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                placeholder="e.g., IT Department"
                required
              />
            </div>

            <div>
              <Label htmlFor="budget">Budget (ETB)</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="justification">Justification *</Label>
              <Textarea
                id="justification"
                value={formData.justification}
                onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                placeholder="Explain why this request is necessary and how it aligns with organizational goals"
                rows={4}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="expected_outcomes">Expected Outcomes *</Label>
              <Textarea
                id="expected_outcomes"
                value={formData.expected_outcomes}
                onChange={(e) => setFormData({ ...formData, expected_outcomes: e.target.value })}
                placeholder="Describe the expected benefits and outcomes of this request"
                rows={4}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/requests" })}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Request"}
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
