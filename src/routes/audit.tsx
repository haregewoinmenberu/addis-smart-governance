import { createFileRoute } from "@tanstack/react-router";
import { ModuleDataPage } from "@/components/layout/ModuleDataPage";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/audit")({
  head: () => ({ meta: [{ title: "Audit & Compliance — STRP" }, { name: "description", content: "Schedule audits, score compliance, and track corrective actions end-to-end." }] }),
  component: () => (
    <ModuleDataPage
      moduleKey="audit"
      title="Audit & Compliance"
      subtitle="Schedule audits, score compliance, and track corrective actions end-to-end."
      endpoint="/audits"
      columns={[
        { key: "title", label: "Audit" },
        { key: "office", label: "Office" },
        {
          key: "status",
          label: "Status",
          badge: (row) => {
            const status = String(row.status ?? "");
            if (status === "Completed") return { label: status, className: "bg-success/10 text-success border-success/20" };
            if (status === "In progress") return { label: status, className: "bg-info/10 text-info border-info/20" };
            return { label: status || "Scheduled", className: "bg-warning/15 text-warning-foreground border-warning/30" };
          },
        },
        { key: "score", label: "Score", render: (row) => (row.score ? `${row.score}%` : "-") },
        { key: "due_date", label: "Due", render: (row) => formatDate(row.due_date as string) },
      ]}
    />
  ),
});
