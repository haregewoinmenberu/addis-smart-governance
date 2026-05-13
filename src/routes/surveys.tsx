import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Plus, Smile, Frown, Meh, Users } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export const Route = createFileRoute("/surveys")({
  head: () => ({ meta: [{ title: "Surveys & Feedback — STRP" }] }),
  component: Page,
});

const trend = Array.from({ length: 8 }, (_, i) => ({ w: `W${i + 1}`, p: 60 + ((i * 5) % 25), n: 18 - ((i * 2) % 9) }));
const surveys = [
  { t: "Citizen e-Service Satisfaction", responses: 4218, csat: 86, status: "Active" },
  { t: "Vendor Experience Q3", responses: 142, csat: 73, status: "Active" },
  { t: "Sub-City Admin Usability", responses: 318, csat: 81, status: "Closed" },
  { t: "Cybersecurity Awareness", responses: 1027, csat: 79, status: "Active" },
];

function Page() {
  return (
    <AppShell>
      <PageHeader
        title="Surveys & Feedback"
        subtitle="Capture citizen and user sentiment to guide digital service improvements."
        actions={<Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow"><Plus className="h-4 w-4" />New survey</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active surveys" value="12" delta="+3" icon={MessageSquare} accent="primary" />
        <StatCard label="Total responses" value="18,402" delta="+8.4%" icon={Users} accent="info" />
        <StatCard label="Avg. CSAT" value="82%" delta="+2.1%" icon={Smile} accent="success" />
        <StatCard label="Detractors" value="9%" delta="-1.2%" trend="down" icon={Frown} accent="destructive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 p-5 rounded-2xl border-border/60">
          <h3 className="font-semibold tracking-tight mb-1">Sentiment trend</h3>
          <p className="text-xs text-muted-foreground mb-4">Positive vs negative · last 8 weeks</p>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={trend} margin={{ left: -10, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="sp" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} /></linearGradient>
                  <linearGradient id="sn" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--color-destructive)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--color-destructive)" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="w" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="p" stroke="var(--color-success)" fill="url(#sp)" strokeWidth={2} name="Positive" />
                <Area type="monotone" dataKey="n" stroke="var(--color-destructive)" fill="url(#sn)" strokeWidth={2} name="Negative" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border-border/60">
          <h3 className="font-semibold tracking-tight mb-4">Sentiment breakdown</h3>
          {[
            { l: "Positive", v: 71, i: Smile, c: "success" },
            { l: "Neutral", v: 20, i: Meh, c: "info" },
            { l: "Negative", v: 9, i: Frown, c: "destructive" },
          ].map((s) => (
            <div key={s.l} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5"><s.i className={`h-3.5 w-3.5 text-${s.c}`} />{s.l}</span>
                <span className="font-semibold">{s.v}%</span>
              </div>
              <Progress value={s.v} className="h-1.5" />
            </div>
          ))}
        </Card>
      </div>

      <Card className="p-5 rounded-2xl border-border/60">
        <h3 className="font-semibold tracking-tight mb-4">Surveys</h3>
        <div className="space-y-2">
          {surveys.map((s) => (
            <div key={s.t} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-3 rounded-xl border border-border/60">
              <div className="flex-1">
                <p className="text-sm font-medium">{s.t}</p>
                <p className="text-xs text-muted-foreground">{s.responses.toLocaleString()} responses</p>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">CSAT</span><span className="font-semibold">{s.csat}%</span></div>
                <Progress value={s.csat} className="h-1.5" />
              </div>
              <Badge variant="secondary" className={s.status === "Active" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}>{s.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
