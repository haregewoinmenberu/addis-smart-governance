import { createFileRoute } from "@tanstack/react-router";
import { ModuleStub } from "@/components/layout/ModuleStub";

export const Route = createFileRoute("/vendors")({
  head: () => ({ meta: [{ title: "Vendor Management — STRP" }, { name: "description", content: "Onboard, monitor and evaluate technology vendors with SLA scoring." }] }),
  component: () => (
    <ModuleStub
      title="Vendor Management"
      subtitle="Onboard, monitor and evaluate technology vendors with SLA scoring."
      points={["Vendor registration","Legal document verification","SLA monitoring","Vendor performance scoring","Historical analytics","Blacklist management"]}
    />
  ),
});
