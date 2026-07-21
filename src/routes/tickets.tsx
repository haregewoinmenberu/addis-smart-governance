import { createFileRoute, Outlet } from "@tanstack/react-router";

// Parent layout route - renders child routes without wrapping in AppShell
// to avoid duplicate sidebar/header (v2)
export const Route = createFileRoute("/tickets")({
  component: () => <Outlet />,
});
