import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { getAuthToken } from '@/lib/api';

export const Route = createFileRoute('/sub-cities')({
  beforeLoad: async () => {
    const token = getAuthToken();
    if (!token) {
      throw redirect({
        to: "/login",
        search: {
          redirect: "/sub-cities",
        },
      });
    }
  },
  component: () => <Outlet />,
});
