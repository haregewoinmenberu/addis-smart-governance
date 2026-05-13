import { createFileRoute } from "@tanstack/react-router";
import { ModuleStub } from "@/components/layout/ModuleStub";

export const Route = createFileRoute("/cybersecurity")({
  head: () => ({ meta: [{ title: "Cybersecurity Governance — STRP" }, { name: "description", content: "Command center for vulnerability management, incidents, and threat analytics." }] }),
  component: () => (
    <ModuleStub
      title="Cybersecurity Governance"
      subtitle="Command center for vulnerability management, incidents, and threat analytics."
      points={["Vulnerability management","Security posture analytics","Incident reporting & response","Evidence management","Threat analytics dashboards","Risk severity indicators"]}
    />
  ),
});
