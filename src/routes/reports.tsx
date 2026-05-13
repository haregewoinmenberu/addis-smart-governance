import { createFileRoute } from "@tanstack/react-router";
import { ModuleDataPage } from "@/components/layout/ModuleDataPage";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports & Analytics — STRP" }, { name: "description", content: "Executive insights powered by AI across procurement, infrastructure and maturity." }] }),
  component: () => (
    <ModuleDataPage
      moduleKey="reports"
      title="Reports & Analytics"
      subtitle="Executive insights powered by AI across procurement, infrastructure and maturity."
      endpoint="/reports"
      columns={[
        { key: "title", label: "Report" },
        { key: "type", label: "Type" },
        { key: "period", label: "Period" },
        { key: "status", label: "Status" },
        { key: "generated_at", label: "Generated", render: (row) => formatDate(row.generated_at as string) },
      ]}
    />
  ),
});
