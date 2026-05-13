import { createFileRoute } from "@tanstack/react-router";
import { ModuleStub } from "@/components/layout/ModuleStub";

export const Route = createFileRoute("/audit")({
  head: () => ({ meta: [{ title: "Audit & Compliance — STRP" }, { name: "description", content: "Schedule audits, score compliance, and track corrective actions end-to-end." }] }),
  component: () => (
    <ModuleStub
      title="Audit & Compliance"
      subtitle="Schedule audits, score compliance, and track corrective actions end-to-end."
      points={["Audit scheduling calendar","Compliance heatmaps","Corrective action workflow","Risk alerts","Regulatory reporting","Timeline audit trails"]}
    />
  ),
});
