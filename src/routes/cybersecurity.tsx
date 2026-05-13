import { createFileRoute } from "@tanstack/react-router";
import { ModuleDataPage } from "@/components/layout/ModuleDataPage";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/cybersecurity")({
  head: () => ({ meta: [{ title: "Cybersecurity Governance — STRP" }, { name: "description", content: "Command center for vulnerability management, incidents, and threat analytics." }] }),
  component: () => (
    <ModuleDataPage
      moduleKey="cybersecurity"
      title="Cybersecurity Governance"
      subtitle="Command center for vulnerability management, incidents, and threat analytics."
      endpoint="/cybersecurity"
      columns={[
        { key: "title", label: "Issue" },
        { key: "system", label: "System" },
        {
          key: "severity",
          label: "Severity",
          badge: (row) => {
            const severity = String(row.severity ?? "");
            if (severity === "High") return { label: severity, className: "bg-destructive/10 text-destructive border-destructive/20" };
            if (severity === "Medium") return { label: severity, className: "bg-warning/15 text-warning-foreground border-warning/30" };
            return { label: severity || "Low", className: "bg-success/10 text-success border-success/20" };
          },
        },
        { key: "status", label: "Status" },
        { key: "detected_at", label: "Detected", render: (row) => formatDate(row.detected_at as string) },
      ]}
    />
  ),
});
