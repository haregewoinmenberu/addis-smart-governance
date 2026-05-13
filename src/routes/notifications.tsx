import { createFileRoute } from "@tanstack/react-router";
import { ModuleDataPage } from "@/components/layout/ModuleDataPage";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — STRP" }, { name: "description", content: "Real-time alerts, deadline reminders, and multi-channel delivery status." }] }),
  component: () => (
    <ModuleDataPage
      moduleKey="notifications"
      title="Notifications"
      subtitle="Real-time alerts, deadline reminders, and multi-channel delivery status."
      endpoint="/notifications"
      columns={[
        { key: "title", label: "Title" },
        { key: "channel", label: "Channel" },
        { key: "priority", label: "Priority" },
        { key: "recipient", label: "Recipient" },
        { key: "created_at", label: "Sent", render: (row) => formatDate(row.created_at as string) },
      ]}
    />
  ),
});
