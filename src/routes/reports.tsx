import { createFileRoute } from "@tanstack/react-router";
import { ModuleStub } from "@/components/layout/ModuleStub";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports & Analytics — STRP" }, { name: "description", content: "Executive insights powered by AI across procurement, infrastructure and maturity." }] }),
  component: () => (
    <ModuleStub
      title="Reports & Analytics"
      subtitle="Executive insights powered by AI across procurement, infrastructure and maturity."
      points={["Executive reports","AI-powered insights","Procurement analytics","Infrastructure investment analytics","Technology maturity analytics","Export to PDF / Excel"]}
    />
  ),
});
