import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText, Eye, Search, Calendar, User, CheckCircle2,
  XCircle, Clock, AlertTriangle, TrendingUp, BarChart3, FileCheck,
  Activity, Filter, ArrowRightCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getAuthToken } from "@/lib/api";
import { researchCategoryLabels } from "@/lib/research-schema";

export const Route = createFileRoute("/research/reports/")({
  component: () => (
    <RequireAuth>
      <ResearchReportsPage />
    </RequireAuth>
  ),
});

const DECISION_COLORS: Record<string, string> = {
  approved_to_develop: "bg-emerald-500/15 text-emerald-700 border-emerald-400/30",
  transfer_existing: "bg-blue-500/15 text-blue-700 border-blue-400/30",
  customization_of_existing: "bg-purple-500/15 text-purple-700 border-purple-400/30",
  infrastructure_upgrade: "bg-indigo-500/15 text-indigo-700 border-indigo-400/30",
  rejected: "bg-red-500/15 text-red-700 border-red-400/30",
  needs_improvement: "bg-orange-500/15 text-orange-700 border-orange-400/30",
  deferred: "bg-gray-500/15 text-gray-700 border-gray-400/30",
  pending: "bg-yellow-500/15 text-yellow-700 border-yellow-400/30",
  further_review_required: "bg-amber-500/15 text-amber-700 border-amber-400/30",
  resubmit_with_changes: "bg-orange-500/15 text-orange-700 border-orange-400/30",
  approved_with_conditions: "bg-teal-500/15 text-teal-700 border-teal-400/30",
  approved_for_pilot: "bg-cyan-500/15 text-cyan-700 border-cyan-400/30",
  approved_for_full_implementation: "bg-green-500/15 text-green-700 border-green-400/30",
  approved_for_production: "bg-emerald-600/15 text-emerald-800 border-emerald-500/30",
  no_risks: "bg-slate-500/15 text-slate-700 border-slate-400/30",
};

function StatCard({
  title,
  value,
  icon: Icon,
  color = "text-primary",
  bgColor = "bg-primary/10",
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color?: string;
  bgColor?: string;
}) {
  return (
    <Card className="border-border/60 hover:shadow-lg transition-all">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={`${bgColor} p-3 rounded-xl`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResearchReportsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDecision, setFilterDecision] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["research-reports"],
    queryFn: async () => {
      const res = await fetch("/api/research/reports", {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json();
    },
  });

  const reports = data?.data?.reports ?? [];
  const statistics = data?.data?.statistics;

  // Filter reports by search term and decision
  const filteredReports = reports.filter((report: any) => {
    const matchesSearch =
      report.research_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.decision_label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.submitter.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDecision = 
      filterDecision === "all" || report.decision === filterDecision;

    return matchesSearch && matchesDecision;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <PageHeader
            title="Research Reports Dashboard"
            subtitle="Comprehensive overview of all evaluation summary reports and final decisions"
          />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            title="Total Reports"
            value={statistics?.total ?? 0}
            icon={FileText}
            color="text-blue-600"
            bgColor="bg-blue-500/10"
          />
          <StatCard
            title="Under Review"
            value={statistics?.pending ?? 0}
            icon={Clock}
            color="text-amber-600"
            bgColor="bg-amber-500/10"
          />
        </div>

        {/* Decision Breakdown */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Decision Distribution</CardTitle>
                <CardDescription>Detailed breakdown of all evaluation decisions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {statistics?.by_decision?.map((stat: any) => (
                <button
                  key={stat.decision}
                  onClick={() => setFilterDecision(filterDecision === stat.decision ? "all" : stat.decision)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    filterDecision === stat.decision
                      ? "border-primary bg-primary/5 shadow-md"
                      : stat.count > 0
                      ? "border-border/60 hover:border-primary/50 hover:bg-accent/50"
                      : "border-border/40 opacity-60 hover:opacity-100 hover:border-primary/50"
                  }`}
                >
                  <div className={`text-2xl font-bold mb-1 ${stat.count > 0 ? "text-primary" : "text-muted-foreground"}`}>
                    {stat.count}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground line-clamp-2">
                    {stat.label}
                  </div>
                </button>
              ))}
            </div>
            {filterDecision !== "all" && (
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Filter className="h-3 w-3" />
                  Filtered by decision
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterDecision("all")}
                  className="h-7 text-xs"
                >
                  Clear filter
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search & Filters */}
        <Card className="border-border/60">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by research title, decision type, or submitter name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-3">
                <Activity className="h-8 w-8 text-primary animate-pulse" />
                <p className="text-muted-foreground">Loading research reports...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredReports.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-muted rounded-full">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-1">No Reports Found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm || filterDecision !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "No evaluation summary reports have been completed yet."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredReports.length}</span>{" "}
                {filteredReports.length === 1 ? "report" : "reports"}
              </p>
            </div>

            {filteredReports.map((report: any) => (
              <Card key={report.id} className="border-border/60 hover:shadow-lg transition-all overflow-hidden">
                <div className="flex">
                  {/* Color accent bar */}
                  <div className={`w-1.5 ${
                    report.decision.includes('approved') ? 'bg-green-500' :
                    report.decision === 'rejected' ? 'bg-red-500' :
                    report.decision.includes('pending') || report.decision.includes('review') ? 'bg-amber-500' :
                    'bg-gray-400'
                  }`} />
                  
                  <div className="flex-1">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              className={`text-xs font-semibold ${
                                DECISION_COLORS[report.decision] ?? "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {report.decision_label}
                            </Badge>
                            {report.research_category && (
                              <Badge variant="outline" className="text-xs">
                                {researchCategoryLabels[report.research_category as keyof typeof researchCategoryLabels] ??
                                  report.research_category}
                              </Badge>
                            )}
                            {report.has_requester_response ? (
                              <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-400/40 bg-emerald-500/10">
                                Responded
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-amber-700 border-amber-400/40 bg-amber-500/10">
                                Awaiting Response
                              </Badge>
                            )}
                            {report.has_forward && (
                              <Badge variant="outline" className="text-xs text-blue-700 border-blue-400/40 bg-blue-500/10">
                                Forwarded
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg font-bold mb-2">
                            {report.research_title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {report.research_summary}
                          </p>
                        </div>
                        <div className="shrink-0 flex flex-col gap-2 items-end">
                          {report.final_document && (
                            <Button
                              size="sm"
                              className="bg-gradient-primary text-primary-foreground shadow-glow gap-2"
                              onClick={() =>
                                navigate({
                                  to: "/documents/$id",
                                  params: { id: String(report.id) },
                                  search: {
                                    name: report.final_document.file_name,
                                    returnTo: "/research/reports",
                                    type: "research-report-document",
                                    attachmentId: String(report.final_document.id),
                                    path: "",
                                    fileType: "",
                                  },
                                })
                              }
                            >
                              <Eye className="h-4 w-4" />
                              View Report
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() =>
                              navigate({
                                to: "/research/reports/$id/respond",
                                params: { id: String(report.id) },
                              })
                            }
                          >
                            <ArrowRightCircle className="h-4 w-4" />
                            Respond to Requester
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Evaluation Note */}
                      {report.note && (
                        <div className="p-4 bg-muted/50 rounded-lg border border-border/40">
                          <div className="flex items-start gap-2 mb-2">
                            <FileCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <p className="text-xs font-semibold text-muted-foreground">
                              Evaluation Summary:
                            </p>
                          </div>
                          <p className="text-sm leading-relaxed pl-6">{report.note}</p>
                        </div>
                      )}

                      {/* Metadata & Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/40">
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            <span className="font-medium">Submitted:</span> {report.submitter}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            <span className="font-medium">Reviewed:</span> {report.reviewer}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(report.reviewed_at).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() =>
                            navigate({
                              to: "/research/ideas/$id",
                              params: { id: String(report.research_idea_id) },
                              search: { returnTo: "/research/reports" },
                            })
                          }
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Full Request
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
