import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Users, Lock, TrendingUp } from "lucide-react";

export function RBACStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["rbac", "stats"],
    queryFn: async () => {
      const response = await apiClient.get("/rbac/stats");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: "Total Roles",
      value: stats.roles?.total_roles || 0,
      subtitle: `${stats.roles?.with_users || 0} assigned`,
      icon: Shield,
      color: "text-blue-600",
    },
    {
      title: "Total Permissions",
      value: stats.permissions?.total_permissions || 0,
      subtitle: `${Object.keys(stats.permissions?.by_module || {}).length} modules`,
      icon: Lock,
      color: "text-purple-600",
    },
    {
      title: "Users with Roles",
      value: stats.users?.with_roles || 0,
      subtitle: `of ${stats.users?.total_users || 0} total`,
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Active Assignments",
      value: stats.roles?.with_users || 0,
      subtitle: "roles in use",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
