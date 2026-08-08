import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, User, Inbox, Activity, FileText, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/api";
import { researchCategoryLabels } from "@/lib/research-schema";

export const Route = createFileRoute("/research/forwarded-to-me")({
  component: () => (
    <RequireAuth>
      <ForwardedToMePage />
    </RequireAuth>
  ),
});

function ForwardedToMePage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["research-forwarded-to-me"],
    queryFn: async () => {
      const res = await fetch("/api/research/reports/forwarded-to-me", {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch forwarded requests");
      return res.json();
    },
  });

  const forwards = data?.data ?? [];

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Forwarded to Me"
          subtitle="Research requests other sectors or directors have forwarded to you to continue the process"
        />

        {isLoading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-3">
                <Activity className="h-8 w-8 text-primary animate-pulse" />
                <p className="text-muted-foreground">Loading forwarded requests...</p>
              </div>
            </CardContent>
          </Card>
        ) : forwards.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-muted rounded-full">
                  <Inbox className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-1">Nothing Forwarded Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Requests forwarded to you by other sectors or directors will show up here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {forwards.map((fw: any) => (
              <Card key={fw.id} className="border-border/60 hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      {fw.research_idea?.research_category && (
                        <Badge variant="outline" className="text-xs mb-2">
                          {researchCategoryLabels[fw.research_idea.research_category as keyof typeof researchCategoryLabels] ??
                            fw.research_idea.research_category}
                        </Badge>
                      )}
                      <CardTitle className="text-lg font-bold mb-2">
                        {fw.research_idea?.title ?? "Unknown Request"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {fw.research_idea?.summary}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 bg-muted/50 rounded-lg border border-border/40">
                    <div className="flex items-start gap-2 mb-2">
                      <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs font-semibold text-muted-foreground">Forward Note:</p>
                    </div>
                    <p className="text-sm leading-relaxed pl-6">{fw.message}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {fw.certificate_name && (
                      <Button
                        size="sm"
                        className="bg-gradient-primary text-primary-foreground shadow-glow gap-2"
                        onClick={() =>
                          navigate({
                            to: "/documents/$id",
                            params: { id: String(fw.id) },
                            search: {
                              name: fw.certificate_name,
                              returnTo: "/research/forwarded-to-me",
                              type: "research-report-response",
                              path: "",
                              attachmentId: "",
                              fileType: "",
                            },
                          })
                        }
                      >
                        <Mail className="h-4 w-4" />
                        View Letter
                      </Button>
                    )}
                    {fw.final_document && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() =>
                          navigate({
                            to: "/documents/$id",
                            params: { id: String(fw.workflow_progress_id) },
                            search: {
                              name: fw.final_document.file_name,
                              returnTo: "/research/forwarded-to-me",
                              type: "research-report-document",
                              attachmentId: String(fw.final_document.id),
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
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border/40">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      <span className="font-medium">Forwarded by:</span> {fw.responded_by?.name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(fw.sent_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
