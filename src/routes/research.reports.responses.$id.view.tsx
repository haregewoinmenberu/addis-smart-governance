import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Activity, Mail, ArrowRightCircle, Calendar, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/api";

export const Route = createFileRoute("/research/reports/responses/$id/view")({
  component: () => (
    <RequireAuth>
      <SeeResponsePage />
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

function decisionLabel(decision: string | null) {
  if (!decision) return "Unknown";
  return decision.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function SeeResponsePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["research-report-response-view", id],
    queryFn: async () => {
      const res = await fetch(`/api/research/reports/responses/${id}/view`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to load response");
      return json;
    },
  });

  const response = data?.data;
  const isForward = response?.response_type === "forward";

  if (isLoading) {
    return (
      <AppShell>
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-3">
              <Activity className="h-8 w-8 text-primary animate-pulse" />
              <p className="text-muted-foreground">Loading response...</p>
            </div>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  if (error || !response) {
    return (
      <AppShell>
        <Card className="border-border/60">
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">
              {(error as Error)?.message || "This response could not be found."}
            </p>
            <Button variant="outline" className="mt-4 gap-2" onClick={() => navigate({ to: "/notifications" })}>
              <ArrowLeft className="h-4 w-4" />
              Back to Notifications
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/notifications" })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader
            title={isForward ? "Request Forwarded to You" : "Decision Response"}
            subtitle={response.research_idea?.title}
          />
        </div>

        <Card className="border-border/60">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={isForward ? "bg-blue-500/15 text-blue-700 border-blue-400/30" : "bg-emerald-500/15 text-emerald-700 border-emerald-400/30"}>
                {isForward ? "Forwarded" : "Sent to You"}
              </Badge>
              <Badge className={DECISION_COLORS[response.decision] ?? "bg-gray-100 text-gray-700"}>
                {decisionLabel(response.decision)}
              </Badge>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                {isForward ? "Forward Note" : "Message"}
              </p>
              <p className="text-sm leading-relaxed">{response.message}</p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border/40">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span className="font-medium">{isForward ? "Forwarded by:" : "Responded by:"}</span> {response.responded_by?.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(response.sent_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {response.certificate_name && (
                <Button
                  size="sm"
                  className="bg-gradient-primary text-primary-foreground shadow-glow gap-2"
                  onClick={() =>
                    navigate({
                      to: "/documents/$id",
                      params: { id: String(response.id) },
                      search: {
                        name: response.certificate_name,
                        returnTo: `/research/reports/responses/${response.id}/view`,
                        type: "research-report-response",
                        path: "",
                        attachmentId: "",
                        fileType: "",
                      },
                    })
                  }
                >
                  <Mail className="h-4 w-4" />
                  View {isForward ? "Letter" : "Certificate"}
                </Button>
              )}
              {response.final_document && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() =>
                    navigate({
                      to: "/documents/$id",
                      params: { id: String(response.workflow_progress_id) },
                      search: {
                        name: response.final_document.file_name,
                        returnTo: `/research/reports/responses/${response.id}/view`,
                        type: "research-report-document",
                        attachmentId: String(response.final_document.id),
                        path: "",
                        fileType: "",
                      },
                    })
                  }
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Final Report
                </Button>
              )}
              {isForward && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => navigate({ to: "/research/forwarded-to-me" })}
                >
                  <ArrowRightCircle className="h-3.5 w-3.5" />
                  Go to Forwarded to Me
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
