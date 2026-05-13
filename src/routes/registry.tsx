import { createFileRoute } from "@tanstack/react-router";
import { ModuleStub } from "@/components/layout/ModuleStub";

export const Route = createFileRoute("/registry")({
  head: () => ({ meta: [{ title: "Technology Registry — STRP" }, { name: "description", content: "Centralized inventory of every technology asset deployed across Addis Ababa." }] }),
  component: () => (
    <ModuleStub
      title="Technology Registry"
      subtitle="Centralized inventory of every technology asset deployed across Addis Ababa."
      points={["Centralized technology database","Advanced filtering & search","Map-based deployment visualization","Hosting environment management","License & contract tracking","Security classification labels"]}
    />
  ),
});
