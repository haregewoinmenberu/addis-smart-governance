import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getAuthToken } from "@/lib/api";

export const Route = createFileRoute("/users")({
  beforeLoad: async () => {
    const token = getAuthToken();
    if (!token) {
      throw redirect({ to: "/login", search: { redirect: "/users" } });
    }
  },
  component: () => <Outlet />,
});
