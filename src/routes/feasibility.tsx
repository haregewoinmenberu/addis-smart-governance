import { createFileRoute } from "@tanstack/react-router";
import { ModuleStub } from "@/components/layout/ModuleStub";

export const Route = createFileRoute("/feasibility")({
  head: () => ({ meta: [{ title: "Feasibility Studies — STRP" }, { name: "description", content: "Evaluate technical, financial, security and operational feasibility of every initiative." }] }),
  component: () => (
    <ModuleStub
      title="Feasibility Studies"
      subtitle="Evaluate technical, financial, security and operational feasibility of every initiative."
      points={["Technical feasibility evaluation","Financial analysis & ROI","Security assessment","Operational readiness","Vendor evaluation","Risk analysis with SWOT visualization"]}
    />
  ),
});
