import { createFileRoute } from "@tanstack/react-router";
import { ModuleDataPage } from "@/components/layout/ModuleDataPage";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/feasibility")({
  head: () => ({ meta: [{ title: "Feasibility Studies — STRP" }, { name: "description", content: "Evaluate technical, financial, security and operational feasibility of every initiative." }] }),
  component: () => (
    <ModuleDataPage
      moduleKey="feasibility"
      title="Feasibility Studies"
      subtitle="Evaluate technical, financial, security and operational feasibility of every initiative."
      endpoint="/feasibility-studies"
      columns={[
        { key: "title", label: "Study" },
        { key: "office", label: "Office" },
        { key: "status", label: "Status" },
        { key: "score", label: "Score", render: (row) => (row.score ? `${row.score}%` : "-") },
        { key: "reviewed_at", label: "Reviewed", render: (row) => formatDate(row.reviewed_at as string) },
      ]}
    />
  ),
});
