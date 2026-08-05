import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { researchWorkflowAPI } from "@/lib/research-workflow-api";
import { WorkflowStageForm, emptyStageForm } from "@/components/research/WorkflowStageForm";

export const Route = createFileRoute("/research/workflow-stages/create")({
  component: CreateWorkflowStagePage,
});

function CreateWorkflowStagePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, any>) => researchWorkflowAPI.createStage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research-workflow-stages"] });
      toast.success("Workflow stage created");
      navigate({ to: "/research/workflow-stages" });
    },
    onError: (err: any) => toast.error(err.message || "Failed to create stage"),
  });

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="New Workflow Stage"
        subtitle="Configure a new evaluation stage and its dynamic form"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/research/workflow-stages" })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stages
          </Button>
        }
      />

      <WorkflowStageForm
        initial={emptyStageForm}
        onSubmit={(payload) => createMutation.mutate(payload)}
        onCancel={() => navigate({ to: "/research/workflow-stages" })}
        isLoading={createMutation.isPending}
        submitLabel="Create Stage"
      />
    </div>
  );
}
