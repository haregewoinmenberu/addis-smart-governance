import { useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { researchWorkflowAPI } from "@/lib/research-workflow-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus, Edit, Trash2, ChevronUp, ChevronDown, GitBranch, UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import type { ResearchWorkflowStage } from "@/types/research-workflow";
import { FILLABLE_BY_ROLE_LABELS } from "@/components/research/WorkflowStageForm";

const RESEARCH_TYPE_LABELS: Record<string, string> = {
  all: "All Requests",
  system_request: "System Requests",
  infrastructure_request: "Infrastructure Requests",
  security_related_request: "Security-Related Requests",
};

export function WorkflowStageManager() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["research-workflow-stages"],
    queryFn: () => researchWorkflowAPI.getStages(),
  });

  const stages: ResearchWorkflowStage[] = (data?.data || [])
    .slice()
    .sort((a: ResearchWorkflowStage, b: ResearchWorkflowStage) => a.order - b.order);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["research-workflow-stages"] });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => researchWorkflowAPI.deleteStage(id),
    onSuccess: () => {
      invalidate();
      toast.success("Workflow stage deleted");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete stage"),
  });

  const reorderMutation = useMutation({
    mutationFn: (stageIds: number[]) => researchWorkflowAPI.reorderStages(stageIds),
    onSuccess: () => invalidate(),
    onError: (err: any) => toast.error(err.message || "Failed to reorder stages"),
  });

  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= stages.length) return;
    const reordered = stages.slice();
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    reorderMutation.mutate(reordered.map((s) => s.id));
  };

  const handleDelete = (stage: ResearchWorkflowStage) => {
    if (!confirm(`Delete stage "${stage.name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(stage.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Evaluation Workflow Stages</h2>
        </div>
        <Button onClick={() => navigate({ to: "/research/workflow-stages/create" })}>
          <Plus className="h-4 w-4 mr-2" />
          New Stage
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading stages...</div>
      ) : stages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            No workflow stages configured yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {stages.map((stage, index) => (
            <Card key={stage.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex flex-col">
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === 0} onClick={() => handleMove(index, -1)}>
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === stages.length - 1} onClick={() => handleMove(index, 1)}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{stage.name}</p>
                    {!stage.is_active && <Badge variant="outline">Inactive</Badge>}
                    {stage.requires_approval && <Badge variant="secondary">Requires Approval</Badge>}
                    <Badge variant="outline">{RESEARCH_TYPE_LABELS[stage.research_type ?? "all"]}</Badge>
                    {stage.fillable_by_role && (
                      <Badge variant="outline" className="text-blue-700 border-blue-200">
                        <UserCheck className="h-3 w-3 mr-1" />
                        {FILLABLE_BY_ROLE_LABELS[stage.fillable_by_role] ?? stage.fillable_by_role}
                      </Badge>
                    )}
                  </div>
                  {stage.description && (
                    <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {stage.form_fields?.length ?? 0} form field{(stage.form_fields?.length ?? 0) === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate({ to: "/research/workflow-stages/$id/edit", params: { id: String(stage.id) } })}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(stage)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
