import { createFileRoute } from "@tanstack/react-router";
import { ModuleStub } from "@/components/layout/ModuleStub";

export const Route = createFileRoute("/duplication")({
  head: () => ({ meta: [{ title: "Duplication Analysis — STRP" }, { name: "description", content: "Detect overlapping systems across the city with AI-powered similarity scoring." }] }),
  component: () => (
    <ModuleStub
      title="Duplication Analysis"
      subtitle="Detect overlapping systems across the city with AI-powered similarity scoring."
      points={["Side-by-side technology comparison","Similarity scoring visualization","Standardization recommendations","Smart duplicate alerts","Scalability analysis","Consolidation opportunity reports"]}
    />
  ),
});
