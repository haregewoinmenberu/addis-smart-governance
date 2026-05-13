import { createFileRoute } from "@tanstack/react-router";
import { ModuleDataPage } from "@/components/layout/ModuleDataPage";

export const Route = createFileRoute("/vendors")({
  head: () => ({ meta: [{ title: "Vendor Management — STRP" }, { name: "description", content: "Onboard, monitor and evaluate technology vendors with SLA scoring." }] }),
  component: () => (
    <ModuleDataPage
      moduleKey="vendors"
      title="Vendor Management"
      subtitle="Onboard, monitor and evaluate technology vendors with SLA scoring."
      endpoint="/vendors"
      columns={[
        { key: "name", label: "Vendor" },
        { key: "status", label: "Status" },
        { key: "score", label: "Score", render: (row) => `${row.score}/100` },
        { key: "active_projects", label: "Active" },
        { key: "sla_breaches", label: "SLA Breaches" },
      ]}
    />
  ),
});
