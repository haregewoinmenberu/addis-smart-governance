import { createFileRoute } from "@tanstack/react-router";
import { ModuleDataPage } from "@/components/layout/ModuleDataPage";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/users")({
  head: () => ({ meta: [{ title: "User Management & RBAC — STRP" }, { name: "description", content: "Role-based access for Super Admin, ITDB, Auditors, Sub-Cities, Vendors, Analysts." }] }),
  component: () => (
    <ModuleDataPage
      moduleKey="users"
      title="User Management & RBAC"
      subtitle="Role-based access for Super Admin, ITDB, Auditors, Sub-Cities, Vendors, Analysts."
      endpoint="/users"
      columns={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "created_at", label: "Created", render: (row) => formatDate(row.created_at as string) },
      ]}
    />
  ),
});
