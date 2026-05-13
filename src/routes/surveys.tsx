import { createFileRoute } from "@tanstack/react-router";
import { ModuleDataPage } from "@/components/layout/ModuleDataPage";

export const Route = createFileRoute("/surveys")({
  head: () => ({ meta: [{ title: "Surveys & Feedback — STRP" }, { name: "description", content: "Capture citizen and user sentiment to guide digital service improvements." }] }),
  component: () => (
    <ModuleDataPage
      moduleKey="surveys"
      title="Surveys & Feedback"
      subtitle="Capture citizen and user sentiment to guide digital service improvements."
      endpoint="/surveys"
      columns={[
        { key: "title", label: "Survey" },
        { key: "responses", label: "Responses" },
        { key: "sentiment", label: "Sentiment" },
        { key: "status", label: "Status" },
      ]}
    />
  ),
});
