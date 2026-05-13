import { createFileRoute } from "@tanstack/react-router";
import { ModuleDataPage } from "@/components/layout/ModuleDataPage";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/workflows")({
  head: () => ({ meta: [{ title: "Approval Workflows — STRP" }, { name: "description", content: "Design dynamic approval chains with e-signature and notification routing." }] }),
  component: () => (
    <ModuleDataPage
      moduleKey="workflows"
      title="Approval Workflows"
      subtitle="Design dynamic approval chains with e-signature and notification routing."
      endpoint="/workflows"
      columns={[
        { key: "name", label: "Workflow" },
        { key: "owner_office", label: "Owner" },
        { key: "stages", label: "Stages" },
        { key: "active", label: "Active", render: (row) => (row.active ? "Yes" : "No") },
        { key: "last_run_at", label: "Last run", render: (row) => formatDate(row.last_run_at as string) },
      ]}
    />
  ),
});
