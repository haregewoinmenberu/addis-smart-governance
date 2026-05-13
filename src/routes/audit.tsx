import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Calendar, AlertOctagon, FileCheck2, Plus, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/audit")({
  head: () => ({ meta: [{ title: "Audit & Compliance — STRP" }] }),
  component: Page,
});

const subcities = ["Bole", "Yeka", "Kirkos", "Arada", "Gulele", "Lideta", "Akaki"];
const domains = ["Privacy", "Security", "Procurement", "Operations", "Reporting"];
// deterministic heatmap values
const score = (r: number, c: number) => 55 + ((r * 13 + c * 7) % 45);

const upcoming = [
  { t: "Quarterly Privacy Audit · Bole", d: "Sep 22", lead: "A. Hailu", level: "High" },
  { t: "Cybersecurity Compliance · ITDB", d: "Sep 25", lead: "M. Tesfaye", level: "Critical" },
  { t: "Procurement Review · Yeka", d: "Sep 28", lead: "S. Bekele", level: "Medium" },
  { t: "Operational Audit · Arada", d: "Oct 02", lead: "L. Girma", level: "Medium" },
];

const actions = [
  { t: "Patch SSO certificates", o: "ITDB Central", due: "Sep 18", status: "Open" },
  { t: "Update vendor DPA · Sheba Tech", o: "Procurement", due: "Sep 21", status: "In progress" },
  { t: "Re-train sub-city admins", o: "Bole / Yeka", due: "Sep 30", status: "In progress" },
  { t: "Close finding #4421", o: "Kirkos", due: "Oct 05", status: "Open" },
];

const heatColor = (v: number) =>
  v >= 85 ? "bg-success/80 text-success-foreground"
  : v >= 70 ? "bg-success/40 text-foreground"
  : v >= 55 ? "bg-warning/50 text-warning-foreground"
  : "bg-destructive/50 text-destructive-foreground";

function Page() {
  return (
    <AppShell>
      <PageHeader
        title="Audit & Compliance"
        subtitle="Schedule audits, score compliance, and track corrective actions end-to-end."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" />Report</Button>
            <Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow"><Plus className="h-4 w-4" />Schedule audit</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Compliance rate" value="92%" delta="+2.4%" icon={ShieldCheck} accent="success" />
        <StatCard label="Scheduled audits" value="14" delta="+3" icon={Calendar} accent="info" />
        <StatCard label="Open findings" value="27" delta="-5" trend="down" icon={AlertOctagon} accent="warning" />
        <StatCard label="Closed this month" value="41" delta="+12" icon={FileCheck2} accent="primary" />
      </div>

      <Card className="p-5 rounded-2xl border-border/60 mb-6">
        <h3 className="font-semibold tracking-tight mb-1">Compliance heatmap</h3>
        <p className="text-xs text-muted-foreground mb-4">Sub-cities × audit domains</p>
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-1.5">
            <thead>
              <tr>
                <th></th>
                {domains.map((d) => <th key={d} className="text-xs font-medium text-muted-foreground px-2">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {subcities.map((s, r) => (
                <tr key={s}>
                  <td className="text-xs font-medium text-muted-foreground pr-3 text-right">{s}</td>
                  {domains.map((_, c) => {
                    const v = score(r, c);
                    return <td key={c}><div className={cn("h-10 w-20 rounded-md flex items-center justify-center text-xs font-semibold", heatColor(v))}>{v}</div></td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 rounded-2xl border-border/60">
          <h3 className="font-semibold tracking-tight mb-4">Upcoming audits</h3>
          <div className="space-y-2">
            {upcoming.map((u) => (
              <div key={u.t} className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex flex-col items-center justify-center text-[10px] leading-tight">
                    <span>{u.d.split(" ")[0]}</span><span className="font-bold">{u.d.split(" ")[1]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{u.t}</p>
                    <p className="text-xs text-muted-foreground">Lead: {u.lead}</p>
                  </div>
                </div>
                <Badge variant="secondary" className={u.level === "Critical" ? "bg-destructive/10 text-destructive border-destructive/20" : u.level === "High" ? "bg-warning/15 text-warning-foreground border-warning/30" : "bg-info/10 text-info border-info/20"}>{u.level}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border-border/60">
          <h3 className="font-semibold tracking-tight mb-4">Corrective actions</h3>
          <div className="space-y-2">
            {actions.map((a) => (
              <div key={a.t} className="flex items-center justify-between p-3 rounded-xl border border-border/60">
                <div>
                  <p className="text-sm font-medium">{a.t}</p>
                  <p className="text-xs text-muted-foreground">{a.o} · Due {a.due}</p>
                </div>
                <Badge variant="secondary" className={a.status === "Open" ? "bg-warning/15 text-warning-foreground border-warning/30" : "bg-info/10 text-info border-info/20"}>{a.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
