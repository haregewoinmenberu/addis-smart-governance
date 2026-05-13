import { createFileRoute } from "@tanstack/react-router";
import { ModuleDataPage } from "@/components/layout/ModuleDataPage";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/registry")({
  head: () => ({ meta: [{ title: "Technology Registry — STRP" }, { name: "description", content: "Centralized inventory of every technology asset deployed across Addis Ababa." }] }),
  component: () => (
    <ModuleDataPage
      moduleKey="registry"
      title="Technology Registry"
      subtitle="Centralized inventory of every technology asset deployed across Addis Ababa."
      endpoint="/technologies"
      columns={[
        { key: "name", label: "Technology" },
        { key: "category", label: "Category" },
        { key: "owner_office", label: "Office" },
        { key: "status", label: "Status" },
        { key: "deployed_at", label: "Deployed", render: (row) => formatDate(row.deployed_at as string) },
      ]}
    />
  ),
});
