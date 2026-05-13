import { createFileRoute } from "@tanstack/react-router";
import { ModuleDataPage } from "@/components/layout/ModuleDataPage";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — STRP" }, { name: "description", content: "Configure system policies, branding, integrations and notification preferences." }] }),
  component: () => (
    <ModuleDataPage
      moduleKey="settings"
      title="Settings"
      subtitle="Configure system policies, branding, integrations and notification preferences."
      endpoint="/settings"
      columns={[
        { key: "category", label: "Category" },
        { key: "name", label: "Setting" },
        { key: "status", label: "Status" },
      ]}
    />
  ),
});
