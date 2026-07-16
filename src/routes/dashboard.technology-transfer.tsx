import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, FileText, CheckCircle2, AlertCircle, Shield, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";

export const Route = createFileRoute("/dashboard/technology-transfer")({
  component: () => (
    <ProtectedRoute permission="view_technology_transfer_dashboard">
      <AppShell>
        <TechnologyTransferDashboard />
      </AppShell>
    </ProtectedRoute>
  ),
});

function TechnologyTransferDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["technology-transfer-dashboard"],
    queryFn: async () => {
      return apiGet<any>("/dashboards/technology-transfer");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Requests",
      value: data?.total_requests || 0,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      label: "Pending Requests",
      value: data?.pending_requests || 0,
      icon: AlertCircle,
      color: "text-amber-600",
    },
    {
      label: "Approved Requests",
      value: data?.approved_requests || 0,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      label: "Active Technologies",
      value: data?.active_technologies || 0,
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      label: "High Risk Issues",
      value: data?.high_risk_issues || 0,
      icon: Shield,
      color: "text-red-600",
    },
    {
      label: "Active Workflows",
      value: data?.active_workflows || 0,
      icon: Share2,
      color: "text-indigo-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Share2 className="h-8 w-8" />
          Technology Transfer Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Technology requests and governance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data?.recent_requests && data.recent_requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recent_requests.slice(0, 5).map((request: any) => (
                <div key={request.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{request.technology?.name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{request.sub_city?.name}</p>
                  </div>
                  <div className="text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'In review' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
