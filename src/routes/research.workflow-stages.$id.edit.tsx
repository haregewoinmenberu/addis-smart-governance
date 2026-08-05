import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { researchWorkflowAPI } from "@/lib/research-workflow-api";
import { WorkflowStageForm, stageToFormState } from "@/components/research/WorkflowStageForm";
import type { ResearchWorkflowStage } from "@/types/research-workflow";

export const Route = createFileRoute("/research/workflow-stages/$id/edit")({
  component: EditWorkflowStagePage,
});

function EditWorkflowStagePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["research-workflow-stages"],
    queryFn: () => researchWorkflowAPI.getStages(),
  });

  const stage: ResearchWorkflowStage | undefined = (data?.data ?? []).find(
    (s: ResearchWorkflowStage) => String(s.id) === id,
  );

  const updateMutation = useMutation({
    mutationFn: (payload: Record<string, any>) => researchWorkflowAPI.updateStage(Number(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research-workflow-stages"] });
      toast.success("Workflow stage updated");
      navigate({ to: "/research/workflow-stages" });
    },
    onError: (err: any) => toast.error(err.message || "Failed to update stage"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stage) {
    return (
      <div className="max-w-4xl mx-auto text-center py-24">
        <p className="text-lg font-medium mb-4">Workflow stage not found</p>
        <Button onClick={() => navigate({ to: "/research/workflow-stages" })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stages
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title={`Edit Stage: ${stage.name}`}
        subtitle="Update this evaluation stage and its dynamic form"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/research/workflow-stages" })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stages
          </Button>
        }
      />

      <WorkflowStageForm
        initial={stageToFormState(stage)}
        onSubmit={(payload) => updateMutation.mutate(payload)}
        onCancel={() => navigate({ to: "/research/workflow-stages" })}
        isLoading={updateMutation.isPending}
        submitLabel="Update Stage"
      />
    </div>
  );
}
