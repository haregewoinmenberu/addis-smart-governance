import { createFileRoute } from "@tanstack/react-router";
import { ModuleStub } from "@/components/layout/ModuleStub";

export const Route = createFileRoute("/surveys")({
  head: () => ({ meta: [{ title: "Surveys & Feedback — STRP" }, { name: "description", content: "Capture citizen and user sentiment to guide digital service improvements." }] }),
  component: () => (
    <ModuleStub
      title="Surveys & Feedback"
      subtitle="Capture citizen and user sentiment to guide digital service improvements."
      points={["Survey builders","Sentiment analysis","Feedback heatmaps","Service quality evaluation","Usability analysis","Technology impact reports"]}
    />
  ),
});
