import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/RequireAuth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — STRP Portal" },
      { name: "description", content: "Smart Technology Regulatory Portal — Addis Ababa City Innovation and Technology Development Bureau dashboard." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  ),
});
