import { createFileRoute } from "@tanstack/react-router";
import { ModuleStub } from "@/components/layout/ModuleStub";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — STRP" }, { name: "description", content: "Real-time alerts, deadline reminders, and multi-channel delivery status." }] }),
  component: () => (
    <ModuleStub
      title="Notifications"
      subtitle="Real-time alerts, deadline reminders, and multi-channel delivery status."
      points={["Real-time notifications","SMS / email status indicators","Priority indicators","Deadline reminders","Activity feeds","Alert escalation rules"]}
    />
  ),
});
