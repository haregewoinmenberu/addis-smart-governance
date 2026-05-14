import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { getWorkflows, getWorkflowInstances } from "@/lib/api";
import { GitBranch, Plus, CheckCircle2, Clock, FileSignature, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/workflows")({
  head: () => ({ meta: [{ title: "Approval Workflows — STRP" }] }),
  component: () => (
    <RequireAuth>
      <Page />
    </RequireAuth>
  ),
});

function Page() {
  const { data: workflowsData, isLoading: loadingWorkflows } = useQuery({
    queryKey: ["workflows"],
    queryFn: () => getWorkflows(),
  });

  const { data: instancesData, isLoading: loadingInstances } = useQuery({
    queryKey: ["workflow-instances", "pending"],
    queryFn: () => getWorkflowInstances({ status: "pending" }),
  });

  const workflows = workflowsData?.data ?? [];
  const pendingInstances = instancesData?.data ?? [];

  // Calculate statistics
  const activeWorkflows = workflows.filter((w: any) => w.is_active).length;
  const pendingApprovals = pendingInstances.length;
  const completedThisMonth = 0; // Would need additional API endpoint for this

  return (
    <AppShell>
      <PageHeader
        title="Approval Workflows"
        subtitle="Design dynamic approval chains with e-signature and notification routing."
        actions={
          <Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow">
            <Plus className="h-4 w-4" />New workflow
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active workflows" value={activeWorkflows.toString()} icon={GitBranch} accent="primary" />
        <StatCard label="Pending approvals" value={pendingApprovals.toString()} icon={Clock} accent="warning" />
        <StatCard label="Completed this month" value={completedThisMonth.toString()} icon={CheckCircle2} accent="success" />
        <StatCard label="Total workflows" value={workflows.length.toString()} icon={FileSignature} accent="info" />
      </div>

      {loadingWorkflows ? (
        <div className="text-center py-8 text-muted-foreground">Loading workflows...</div>
      ) : workflows.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <p>No workflows configured yet</p>
        </Card>
      ) : (
        <div className="space-y-4 mb-6">
          {workflows.map((workflow: any) => {
            const stages = workflow.stages || [];
            return (
              <Card key={workflow.id} className="p-5 rounded-2xl border-border/60">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-semibold tracking-tight">{workflow.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {stages.length} steps · {workflow.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Edit flow</Button>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {stages.map((stage: any, i: number) => (
                    <div key={stage.name} className="flex items-center gap-2 shrink-0">
                      <div className="px-3 py-2 rounded-xl border text-xs font-medium whitespace-nowrap bg-muted/40 text-muted-foreground border-border/60">
                        {i + 1}. {stage.display_name}
                      </div>
                      {i < stages.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="p-5 rounded-2xl border-border/60">
        <h3 className="font-semibold tracking-tight mb-4">Awaiting your approval</h3>
        {loadingInstances ? (
          <div className="text-center py-4 text-muted-foreground">Loading pending approvals...</div>
        ) : pendingInstances.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No pending approvals</div>
        ) : (
          <div className="space-y-2">
            {pendingInstances.map((instance: any) => (
              <div key={instance.id} className="flex items-center justify-between p-3 rounded-xl border border-border/60">
                <div>
                  <p className="text-sm font-medium">{instance.workflowable?.title || "Workflow Instance"}</p>
                  <p className="text-xs text-muted-foreground">
                    {instance.workflow_definition?.name} · Stage {instance.current_stage_index + 1}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-info/10 text-info border-info/20">
                    {instance.status}
                  </Badge>
                  <Button size="sm" className="bg-gradient-primary text-primary-foreground">Review</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </AppShell>
  );
}
