import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getAuthToken } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext,
} from "@/components/ui/pagination";
import {
  Lightbulb, FileStack, Search, User, Calendar, ShieldCheck,
  ClipboardList, Clock, CheckCircle2, XCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { researchCategoryLabels } from "@/lib/research-schema";

function StatCard({ title, value, icon: Icon, color = "text-primary" }: { title: string; value: number; icon: React.ElementType; color?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export const Route = createFileRoute("/technology-requests/")({
  component: () => (
    <RequireAuth>
      <CombinedRequestsPage />
    </RequireAuth>
  ),
});

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-500/10 text-gray-600 border-gray-400/30",
  submitted: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  under_review: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-700 border-green-500/20",
  rejected: "bg-red-500/10 text-red-700 border-red-500/20",
  completed: "bg-green-500/10 text-green-700 border-green-500/20",
  on_hold: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  processing: "bg-blue-500/10 text-blue-700 border-blue-500/20",
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  licensing: "Licensing",
  lms: "LMS Enrollment",
};

function CombinedRequestsPage() {
  const navigate = useNavigate();
  const [techSearch, setTechSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [techPage, setTechPage] = useState(1);
  const [servicePage, setServicePage] = useState(1);

  const { data: ideasData, isLoading: ideasLoading } = useQuery({
    queryKey: ["combined-technology-requests", techSearch, techPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (techSearch) params.append("search", techSearch);
      params.append("page", String(techPage));
      const res = await fetch(`/api/research-ideas?${params}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch technology requests");
      return res.json();
    },
  });

  const { data: serviceData, isLoading: serviceLoading } = useQuery({
    queryKey: ["combined-service-requests", serviceSearch, servicePage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (serviceSearch) params.append("search", serviceSearch);
      params.append("page", String(servicePage));
      const res = await fetch(`/api/service-forms?${params}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch service requests");
      return res.json();
    },
  });

  const handleTechSearchChange = (value: string) => {
    setTechSearch(value);
    setTechPage(1);
  };

  const handleServiceSearchChange = (value: string) => {
    setServiceSearch(value);
    setServicePage(1);
  };

  const ideas: any[] = ideasData?.data ?? [];
  // Only licensing/lms remain in Service Requests — research/transformation
  // now flow into Technology Requests directly.
  const serviceSubmissions: any[] = (serviceData?.data ?? []).filter(
    (s: any) => s.service_type === "licensing" || s.service_type === "lms",
  );
  const serviceLastPage = serviceData?.pagination?.last_page ?? 1;
  const techLastPage = ideasData?.last_page ?? 1;

  const allItems = [
    ...ideas.map((i) => i.status),
    ...serviceSubmissions.map((s) => s.status),
  ];
  const totalCount = (ideasData?.total ?? ideas.length) + (serviceData?.pagination?.total ?? serviceSubmissions.length);
  const pendingCount = allItems.filter((s) => ["draft", "submitted", "pending", "under_review", "processing", "on_hold"].includes(s)).length;
  const approvedCount = allItems.filter((s) => ["approved", "completed"].includes(s)).length;
  const rejectedCount = allItems.filter((s) => s === "rejected").length;

  return (
    <AppShell>
      <PageHeader
        title="Requests"
        subtitle="Technology requests and citizen service requests in one place"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Requests" value={totalCount} icon={ClipboardList} />
        <StatCard title="Pending / In Progress" value={pendingCount} icon={Clock} color="text-amber-500" />
        <StatCard title="Approved" value={approvedCount} icon={CheckCircle2} color="text-green-500" />
        <StatCard title="Rejected" value={rejectedCount} icon={XCircle} color="text-red-500" />
      </div>

      <Tabs defaultValue="technology" className="space-y-4">
        <TabsList>
          <TabsTrigger value="technology" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            Technology Requests
            {ideas.length > 0 && <Badge variant="secondary" className="ml-1">{ideasData?.total ?? ideas.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="service" className="gap-2">
            <FileStack className="h-4 w-4" />
            Licensing &amp; LMS
            {serviceSubmissions.length > 0 && <Badge variant="secondary" className="ml-1">{serviceSubmissions.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="technology" className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search technology requests…"
              value={techSearch}
              onChange={(e) => handleTechSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {ideasLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading…</div>
          ) : ideas.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                No technology requests found.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {ideas.map((idea) => (
                <Card
                  key={idea.id}
                  className="hover:shadow-md transition-all cursor-pointer border-border/60"
                  onClick={() =>
                    navigate({
                      to: "/research/ideas/$id",
                      params: { id: String(idea.id) },
                      search: { returnTo: "/technology-requests" },
                    })
                  }
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm font-semibold truncate">{idea.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <User className="h-3 w-3" />
                          {idea.is_external_request
                            ? `${idea.requester_name ?? "External requester"}`
                            : idea.submitter?.name ?? "Unknown"}
                          <span className="text-border">·</span>
                          <Calendar className="h-3 w-3" />
                          {new Date(idea.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                        {idea.is_external_request && (
                          <Badge variant="outline" className="text-xs text-purple-700 border-purple-200">External</Badge>
                        )}
                        <Badge className={`text-xs ${STATUS_STYLES[idea.status] ?? ""}`}>
                          {idea.status?.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{idea.summary}</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {idea.research_category && (
                        <Badge variant="outline" className="text-[11px]">
                          {researchCategoryLabels[idea.research_category as keyof typeof researchCategoryLabels] ?? idea.research_category}
                        </Badge>
                      )}
                      {idea.assigned_director_name ? (
                        <Badge variant="outline" className="text-[11px] text-blue-700 border-blue-200">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Director: {idea.assigned_director_name}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[11px] text-muted-foreground">
                          No director assigned
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {techLastPage > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => techPage > 1 && setTechPage(techPage - 1)}
                    className={techPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm text-muted-foreground px-2">
                    Page {techPage} of {techLastPage}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => techPage < techLastPage && setTechPage(techPage + 1)}
                    className={techPage >= techLastPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>

        <TabsContent value="service" className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search licensing/LMS requests…"
              value={serviceSearch}
              onChange={(e) => handleServiceSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {serviceLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading…</div>
          ) : serviceSubmissions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                No licensing or LMS requests found.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {serviceSubmissions.map((sub) => (
                <Card
                  key={sub.id}
                  className="hover:shadow-md transition-all cursor-pointer border-border/60"
                  onClick={() =>
                    navigate({
                      to: "/service-requests/$id",
                      params: { id: String(sub.id) },
                      search: { returnTo: "/technology-requests" },
                    })
                  }
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm font-semibold truncate">
                          {sub.submitted_name ?? sub.reference_number}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <Calendar className="h-3 w-3" />
                          {new Date(sub.submission_timestamp ?? sub.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          <span className="text-border">·</span>
                          {sub.reference_number}
                        </p>
                      </div>
                      <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                        <Badge variant="outline" className="text-xs">
                          {SERVICE_TYPE_LABELS[sub.service_type] ?? sub.service_type}
                        </Badge>
                        <Badge className={`text-xs ${STATUS_STYLES[sub.status] ?? ""}`}>
                          {sub.status?.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}

          {serviceLastPage > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => servicePage > 1 && setServicePage(servicePage - 1)}
                    className={servicePage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm text-muted-foreground px-2">
                    Page {servicePage} of {serviceLastPage}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => servicePage < serviceLastPage && setServicePage(servicePage + 1)}
                    className={servicePage >= serviceLastPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
