import { createFileRoute } from "@tanstack/react-router";
import { WorkflowStageManager } from "@/components/research/WorkflowStageManager";

export const Route = createFileRoute("/research/workflow-stages/")({
  component: WorkflowStageManager,
});
