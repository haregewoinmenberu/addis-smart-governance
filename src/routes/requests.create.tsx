import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useToast } from "@/hooks/use-toast";
import { createRequest } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/requests/create")({
  head: () => ({ meta: [{ title: "Create Request — STRP" }] }),
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

  const createMutation = useMutation({
    mutationFn: createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["request-statistics"] });
      toast({
        title: "Success",
        description: "Request created successfully",
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
    createMutation.mutate({
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : null,
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="Create New Request"
        subtitle="Submit a new technology request for review and approval"
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
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Request"}
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
