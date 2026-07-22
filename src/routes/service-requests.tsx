import { createFileRoute, Outlet } from "@tanstack/react-router";

// Parent layout route for service requests
// Allows child routes (index and $id) to render independently
export const Route = createFileRoute("/service-requests")({
  component: () => <Outlet />,
});
