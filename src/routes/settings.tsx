import { createFileRoute } from "@tanstack/react-router";
import { ModuleStub } from "@/components/layout/ModuleStub";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — STRP" }, { name: "description", content: "Configure system policies, branding, integrations and notification preferences." }] }),
  component: () => (
    <ModuleStub
      title="Settings"
      subtitle="Configure system policies, branding, integrations and notification preferences."
      points={["System configurations","Workflow settings","Notification preferences","Branding settings","Security policies","API integrations"]}
    />
  ),
});
