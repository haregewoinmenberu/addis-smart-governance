import { createFileRoute } from "@tanstack/react-router";
import { getAuthToken } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, TrendingUp, DollarSign, Target, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/research/reports")({
  component: () => (
    <RequireAuth>
      <ResearchReportsPage />
    </RequireAuth>
  ),
});

function ResearchReportsPage() {
  const { data: stats } = useQuery({
    queryKey: ["research-reports-stats"],
    queryFn: async () => {
      const response = await fetch('/api/research-projects/dashboard', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      return response.json();
    },
  });

  const reportCategories = [
    {
      title: "Research Pipeline Report",
      description: "Overview of all research projects by stage",
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Projects by Stage",
      description: "Distribution across research lifecycle",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "TRL Analysis",
      description: "Technology readiness level distribution",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Budget Utilization",
      description: "Financial allocation and spending analysis",
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Innovation Metrics",
      description: "Key performance indicators and outcomes",
      icon: TrendingUp,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      title: "Research Output",
      description: "Publications, patents, and deliverables",
      icon: FileText,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      title: "Transfer Success Rate",
      description: "Technology transfer and commercialization",
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Research Reports"
        subtitle="Generate comprehensive reports and analytics"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{stats?.data?.total_projects || 0}</p>
              </div>
              <Target className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Research</p>
                <p className="text-2xl font-bold">{stats?.data?.active_projects || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats?.data?.completed_projects || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-lg font-bold">
                  {stats?.data?.total_budget ? new Intl.NumberFormat('en-ET', { 
                    style: 'currency', 
                    currency: 'ETB',
                    notation: 'compact',
                    maximumFractionDigits: 1 
                  }).format(stats.data.total_budget) : 'ETB 0'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Categories */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Reports</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportCategories.map((report, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${report.bgColor}`}>
                    <report.icon className={`h-6 w-6 ${report.color}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {report.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Reports */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Custom Report Builder</CardTitle>
          <CardDescription>
            Create custom reports with specific filters and date ranges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Custom report builder coming soon</p>
            <p className="text-sm mt-1">Select date ranges, filters, and metrics for tailored reports</p>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
