import { createFileRoute } from "@tanstack/react-router";
import { ModuleStub } from "@/components/layout/ModuleStub";

export const Route = createFileRoute("/workflows")({
  head: () => ({ meta: [{ title: "Approval Workflows — STRP" }, { name: "description", content: "Design dynamic approval chains with e-signature and notification routing." }] }),
  component: () => (
    <ModuleStub
      title="Approval Workflows"
      subtitle="Design dynamic approval chains with e-signature and notification routing."
      points={["Visual workflow builder","Drag-and-drop approval chains","E-signature integration","Multi-level approvals","Approval history","Notification routing"]}
    />
  ),
});
