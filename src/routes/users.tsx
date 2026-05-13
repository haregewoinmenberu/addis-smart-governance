import { createFileRoute } from "@tanstack/react-router";
import { ModuleStub } from "@/components/layout/ModuleStub";

export const Route = createFileRoute("/users")({
  head: () => ({ meta: [{ title: "User Management & RBAC — STRP" }, { name: "description", content: "Role-based access for Super Admin, ITDB, Auditors, Sub-Cities, Vendors, Analysts." }] }),
  component: () => (
    <ModuleStub
      title="User Management & RBAC"
      subtitle="Role-based access for Super Admin, ITDB, Auditors, Sub-Cities, Vendors, Analysts."
      points={["Permission matrix","Role assignment","User activity logs","Access control management","SSO integration","Session monitoring"]}
    />
  ),
});
