import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lock, ShieldAlert, Bug, Activity, Siren, Plus } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export const Route = createFileRoute("/cybersecurity")({
  head: () => ({ meta: [{ title: "Cybersecurity Governance — STRP" }] }),
  component: Page,
});

const trend = Array.from({ length: 12 }, (_, i) => ({ d: `D${i + 1}`, t: 12 + ((i * 7) % 18), b: 4 + ((i * 3) % 9) }));

const incidents = [
  { id: "IR-9821", t: "Phishing campaign · ITDB", sev: "High", status: "Investigating", ago: "12m" },
  { id: "IR-9820", t: "Brute-force on SSO portal", sev: "Critical", status: "Contained", ago: "1h" },
  { id: "IR-9819", t: "Unusual data egress · CRM", sev: "Medium", status: "Monitoring", ago: "3h" },
  { id: "IR-9818", t: "Outdated TLS on legacy app", sev: "Low", status: "Resolved", ago: "1d" },
];

const vulns = [
  { c: "Critical", v: 4, color: "destructive" },
  { c: "High", v: 11, color: "warning" },
  { c: "Medium", v: 38, color: "info" },
  { c: "Low", v: 92, color: "success" },
];

const sev = (s: string) =>
  s === "Critical" ? "bg-destructive/10 text-destructive border-destructive/20"
  : s === "High" ? "bg-warning/15 text-warning-foreground border-warning/30"
  : s === "Medium" ? "bg-info/10 text-info border-info/20"
  : "bg-success/10 text-success border-success/20";

function Page() {
  return (
    <AppShell>
      <PageHeader
        title="Cybersecurity Governance"
        subtitle="Command center for vulnerability management, incidents, and threat analytics."
        actions={<Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow"><Plus className="h-4 w-4" />Report incident</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Security posture" value="A−" delta="+1 grade" icon={Lock} accent="success" />
        <StatCard label="Open vulnerabilities" value="145" delta="-22" trend="down" icon={Bug} accent="warning" />
        <StatCard label="Active incidents" value="6" delta="+2" trend="down" icon={Siren} accent="destructive" />
        <StatCard label="Mean time to detect" value="14m" delta="-3m" trend="down" icon={Activity} accent="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 p-5 rounded-2xl border-border/60">
          <h3 className="font-semibold tracking-tight mb-1">Threat & block trend</h3>
          <p className="text-xs text-muted-foreground mb-4">Last 12 days</p>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={trend} margin={{ left: -10, right: 8, top: 8 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="d" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="t" stroke="var(--color-destructive)" strokeWidth={2} dot={false} name="Threats" />
                <Line type="monotone" dataKey="b" stroke="var(--color-success)" strokeWidth={2} dot={false} name="Blocked" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border-border/60">
          <h3 className="font-semibold tracking-tight mb-4">Vulnerability severity</h3>
          <div className="space-y-4">
            {vulns.map((v) => (
              <div key={v.c}>
                <div className="flex justify-between text-xs mb-1.5"><span className="text-muted-foreground">{v.c}</span><span className="font-semibold">{v.v}</span></div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden"><div className={`h-full bg-${v.color}`} style={{ width: `${Math.min(100, v.v)}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5 rounded-2xl border-border/60">
        <h3 className="font-semibold tracking-tight mb-4">Recent incidents</h3>
        <div className="space-y-2">
          {incidents.map((i) => (
            <div key={i.id} className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center"><ShieldAlert className="h-4 w-4" /></div>
                <div>
                  <p className="text-sm font-medium">{i.t}</p>
                  <p className="text-xs text-muted-foreground">{i.id} · {i.ago} ago</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={sev(i.sev)}>{i.sev}</Badge>
                <span className="text-xs text-muted-foreground">{i.status}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
