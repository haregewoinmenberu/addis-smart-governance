import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, FileText, AlertCircle, Calendar, Users, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";

export const Route = createFileRoute("/dashboard/licensing")({
  component: () => (
    <ProtectedRoute permission="view_licensing_dashboard">
      <AppShell>
        <LicensingDashboard />
      </AppShell>
    </ProtectedRoute>
  ),
});

function LicensingDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["licensing-dashboard"],
    queryFn: async () => {
      return apiGet<any>("/dashboards/licensing");
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
      label: "Total Applications",
      value: data?.total_applications || 0,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      label: "Pending Review",
      value: data?.pending_review || 0,
      icon: AlertCircle,
      color: "text-amber-600",
    },
    {
      label: "Active Licenses",
      value: data?.active_licenses || 0,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      label: "Pending Verifications",
      value: data?.pending_verifications || 0,
      icon: Users,
      color: "text-purple-600",
    },
    {
      label: "Upcoming Exams",
      value: data?.upcoming_examinations || 0,
      icon: Calendar,
      color: "text-indigo-600",
    },
    {
      label: "Open Complaints",
      value: data?.open_complaints || 0,
      icon: AlertCircle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Award className="h-8 w-8" />
          Professional Licensing Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          License applications and compliance management
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

      {data?.recent_applications && data.recent_applications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recent_applications.slice(0, 5).map((app: any) => (
                <div key={app.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{app.applicant?.name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{app.profession?.name}</p>
                  </div>
                  <div className="text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      app.status === 'approved' ? 'bg-green-100 text-green-800' :
                      app.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {app.status}
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
