import { createFileRoute } from "@tanstack/react-router";
import { ModuleInfoPage } from "@/components/layout/ModuleInfoPage";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password — STRP" }, { name: "description", content: "Recover access to your government account." }] }),
  component: () => (
    <ModuleInfoPage
      moduleKey="forgot-password"
      fallbackTitle="Forgot Password"
      fallbackSubtitle="Recover access to your government account."
      fallbackPoints={["Email verification","Identity confirmation","Secure recovery links","Audit logging","SMS fallback","Multi-factor support"]}
    />
  ),
});
