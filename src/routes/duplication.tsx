import { createFileRoute } from "@tanstack/react-router";
import { ModuleDataPage } from "@/components/layout/ModuleDataPage";

export const Route = createFileRoute("/duplication")({
  head: () => ({ meta: [{ title: "Duplication Analysis — STRP" }, { name: "description", content: "Detect overlapping systems across the city with AI-powered similarity scoring." }] }),
  component: () => (
    <ModuleDataPage
      moduleKey="duplication"
      title="Duplication Analysis"
      subtitle="Detect overlapping systems across the city with AI-powered similarity scoring."
      endpoint="/duplications"
      columns={[
        { key: "title", label: "Case" },
        {
          key: "systems",
          label: "Systems",
          render: (row) => Array.isArray(row.systems) ? row.systems.join(", ") : String(row.systems ?? ""),
        },
        { key: "similarity_score", label: "Similarity", render: (row) => `${row.similarity_score}%` },
        { key: "status", label: "Status" },
      ]}
    />
  ),
});
