import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Plus, CheckCircle2, Clock, FileSignature, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/workflows")({
  head: () => ({ meta: [{ title: "Approval Workflows — STRP" }] }),
  component: Page,
});

const flows = [
  { n: "Technology Procurement", steps: ["Requestor", "Sub-City Lead", "ITDB Review", "Finance", "Director Sign-off"], active: 3, used: 412 },
  { n: "Cybersecurity Exception", steps: ["Owner", "CISO Review", "Risk Committee"], active: 2, used: 87 },
  { n: "Vendor Onboarding", steps: ["Submission", "Legal", "Compliance", "ITDB Approval"], active: 1, used: 156 },
];

const queue = [
  { t: "Smart Traffic Mgmt v2", flow: "Procurement", step: "ITDB Review", waited: "2d", level: "High" },
  { t: "Sheba Tech contract renewal", flow: "Vendor", step: "Legal", waited: "6h", level: "Medium" },
  { t: "Citizen ID API extension", flow: "Procurement", step: "Finance", waited: "1d", level: "High" },
];

function Page() {
  return (
    <AppShell>
      <PageHeader
        title="Approval Workflows"
        subtitle="Design dynamic approval chains with e-signature and notification routing."
        actions={<Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow"><Plus className="h-4 w-4" />New workflow</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active workflows" value="12" delta="+2" icon={GitBranch} accent="primary" />
        <StatCard label="Pending approvals" value="38" delta="-7" trend="down" icon={Clock} accent="warning" />
        <StatCard label="Completed this month" value="214" delta="+18" icon={CheckCircle2} accent="success" />
        <StatCard label="E-signatures" value="1,108" delta="+5%" icon={FileSignature} accent="info" />
      </div>

      <div className="space-y-4 mb-6">
        {flows.map((f) => (
          <Card key={f.n} className="p-5 rounded-2xl border-border/60">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-semibold tracking-tight">{f.n}</h3>
                <p className="text-xs text-muted-foreground">{f.used} runs · {f.steps.length} steps</p>
              </div>
              <Button variant="outline" size="sm">Edit flow</Button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {f.steps.map((s, i) => (
                <div key={s} className="flex items-center gap-2 shrink-0">
                  <div className={`px-3 py-2 rounded-xl border text-xs font-medium whitespace-nowrap ${i < f.active ? "bg-primary/10 text-primary border-primary/30" : i === f.active ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow" : "bg-muted/40 text-muted-foreground border-border/60"}`}>
                    {i + 1}. {s}
                  </div>
                  {i < f.steps.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5 rounded-2xl border-border/60">
        <h3 className="font-semibold tracking-tight mb-4">Awaiting your approval</h3>
        <div className="space-y-2">
          {queue.map((q) => (
            <div key={q.t} className="flex items-center justify-between p-3 rounded-xl border border-border/60">
              <div>
                <p className="text-sm font-medium">{q.t}</p>
                <p className="text-xs text-muted-foreground">{q.flow} · {q.step} · waiting {q.waited}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className={q.level === "High" ? "bg-warning/15 text-warning-foreground border-warning/30" : "bg-info/10 text-info border-info/20"}>{q.level}</Badge>
                <Button size="sm" className="bg-gradient-primary text-primary-foreground">Review</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
