import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getDashboard } from "@/lib/api";
import {
  Database, Activity, Clock, Copy, ShieldAlert, CheckCircle2,
  Building2, Sparkles, Wallet, TrendingUp, Download, Plus, ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Executive Dashboard — STRP Portal" },
      { name: "description", content: "Smart Technology Regulatory Portal — Addis Ababa City Innovation and Technology Development Bureau executive dashboard." },
    ],
  }),
  component: Dashboard,
});

const statIcons = [
  Database,
  Activity,
  Clock,
  Copy,
  ShieldAlert,
  CheckCircle2,
  Building2,
  Sparkles,
];

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  const stats = (data?.stats ?? []).map((item, index) => ({
    ...item,
    icon: statIcons[index] ?? Database,
  }));

  const investment = data?.investment ?? [];
  const subcity = data?.subcity ?? [];
  const compliance = data?.compliance ?? [];
  const insights = data?.insights ?? [];
  const approvals = data?.approvals ?? [];
  const readiness = data?.readiness ?? [];

  return (
    <AppShell>
      <PageHeader
        title="Executive Dashboard"
        subtitle="Real-time governance overview across Addis Ababa city technology infrastructure."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" />Export</Button>
            <Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
              <Plus className="h-4 w-4" />New request
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <StatCard
            key={`${stat.label}-${index}`}
            label={stat.label as string}
            value={String(stat.value)}
            delta={stat.delta as string}
            trend={(stat.trend as "up" | "down" | undefined) ?? "up"}
            icon={stat.icon}
            accent={stat.accent as "primary" | "info" | "warning" | "destructive" | "success"}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 p-5 rounded-2xl border-border/60">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold tracking-tight">Infrastructure Investment Trends</h3>
              <p className="text-xs text-muted-foreground">Capital vs operational spend (Billion ETB)</p>
            </div>
            <Badge variant="secondary" className="gap-1"><Wallet className="h-3 w-3" />FY 2025</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={investment} margin={{ left: -10, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-info)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-info)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="v" stroke="var(--color-primary)" strokeWidth={2} fill="url(#g1)" name="Capital" />
                <Area type="monotone" dataKey="c" stroke="var(--color-info)" strokeWidth={2} fill="url(#g2)" name="Operational" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border-border/60">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold tracking-tight">Compliance Distribution</h3>
              <p className="text-xs text-muted-foreground">Across 1,284 systems</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={compliance} dataKey="v" nameKey="name" innerRadius={60} outerRadius={92} paddingAngle={3}>
                  {compliance.map((d, i) => <Cell key={i} fill={d.c} />)}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 p-5 rounded-2xl border-border/60">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold tracking-tight">Technology Distribution by Sub-City</h3>
              <p className="text-xs text-muted-foreground">Registered systems per administrative zone</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={subcity} margin={{ left: -10, right: 8, top: 8 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Bar dataKey="v" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border-border/60 bg-linear-to-br from-primary/5 via-card to-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold tracking-tight text-sm">AI Insights</h3>
              <p className="text-[11px] text-muted-foreground">Generated 2 minutes ago</p>
            </div>
          </div>
          <div className="space-y-3">
            {insights.map((i: { t: string; b: string }, k: number) => (
              <div key={k} className="rounded-xl border border-border/60 bg-card/60 p-3 hover:border-primary/30 transition-colors">
                <p className="text-sm font-medium leading-snug">{i.t}</p>
                <p className="text-xs text-muted-foreground mt-1">{i.b}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5 rounded-2xl border-border/60">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold tracking-tight">Recent Approvals</h3>
            <Button variant="ghost" size="sm" className="gap-1 text-xs">View all <ArrowUpRight className="h-3 w-3" /></Button>
          </div>
          <div className="space-y-1">
            {approvals.map((r: { t: string; o: string; s: string; v: string }, i: number) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{r.t}</p>
                  <p className="text-xs text-muted-foreground">{r.o}</p>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    r.v === "success" ? "bg-success/10 text-success border-success/20"
                    : r.v === "warning" ? "bg-warning/15 text-warning-foreground border-warning/30"
                    : "bg-destructive/10 text-destructive border-destructive/20"
                  }
                >{r.s}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border-border/60">
          <h3 className="font-semibold tracking-tight mb-4">Smart City Readiness</h3>
          <div className="space-y-4">
            {readiness.map((p: { l: string; v: number }, i: number) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">{p.l}</span>
                  <span className="font-semibold">{p.v}%</span>
                </div>
                <Progress value={p.v} className="h-1.5" />
              </div>
            ))}
            <div className="flex items-center gap-2 pt-2 text-xs text-success">
              <TrendingUp className="h-3.5 w-3.5" /> Overall index up 3.1 points QoQ
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
