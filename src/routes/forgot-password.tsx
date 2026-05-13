import { createFileRoute } from "@tanstack/react-router";
import { ModuleStub } from "@/components/layout/ModuleStub";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password — STRP" }, { name: "description", content: "Recover access to your government account." }] }),
  component: () => (
    <ModuleStub
      title="Forgot Password"
      subtitle="Recover access to your government account."
      points={["Email verification","Identity confirmation","Secure recovery links","Audit logging","SMS fallback","Multi-factor support"]}
    />
  ),
});
