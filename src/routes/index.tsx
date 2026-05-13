import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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

const investment = [
  { m: "Jan", v: 2.4, c: 1.8 }, { m: "Feb", v: 3.1, c: 2.2 }, { m: "Mar", v: 2.8, c: 2.5 },
  { m: "Apr", v: 3.6, c: 2.9 }, { m: "May", v: 4.2, c: 3.1 }, { m: "Jun", v: 4.8, c: 3.6 },
  { m: "Jul", v: 5.4, c: 4.0 }, { m: "Aug", v: 5.1, c: 4.4 }, { m: "Sep", v: 6.2, c: 4.9 },
];

const subcity = [
  { name: "Bole", v: 142 }, { name: "Yeka", v: 118 }, { name: "Kirkos", v: 96 },
  { name: "Arada", v: 84 }, { name: "Gulele", v: 71 }, { name: "Lideta", v: 63 }, { name: "Akaki", v: 52 },
];

const compliance = [
  { name: "Compliant", v: 68, c: "var(--color-success)" },
  { name: "Pending", v: 22, c: "var(--color-warning)" },
  { name: "At risk", v: 10, c: "var(--color-destructive)" },
];

function Dashboard() {
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
        <StatCard label="Registered Technologies" value="1,284" delta="+8.2%" icon={Database} accent="primary" />
        <StatCard label="Active Projects" value="312" delta="+4.1%" icon={Activity} accent="info" />
        <StatCard label="Pending Requests" value="47" delta="-12%" trend="down" icon={Clock} accent="warning" />
        <StatCard label="Duplicate Systems" value="19" delta="-3" trend="down" icon={Copy} accent="destructive" />
        <StatCard label="Cybersecurity Risk" value="Low · 24" delta="-6 pts" trend="down" icon={ShieldAlert} accent="success" />
        <StatCard label="Compliance Rate" value="92%" delta="+2.4%" icon={CheckCircle2} accent="success" />
        <StatCard label="Vendor Performance" value="87 / 100" delta="+1.8" icon={Building2} accent="primary" />
        <StatCard label="Smart City Index" value="74.6" delta="+3.1" icon={Sparkles} accent="info" />
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

        <Card className="p-5 rounded-2xl border-border/60 bg-gradient-to-br from-primary/5 via-card to-card">
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
            {[
              { t: "3 sub-cities show overlapping ERP procurement", b: "Consolidation could save ~ETB 14M annually." },
              { t: "Cybersecurity posture improving", b: "Threat exposure dropped 18% across critical assets." },
              { t: "Vendor 'Sheba Tech' breached SLA twice", b: "Recommend escalation to procurement review." },
            ].map((i, k) => (
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
            {[
              { t: "Smart Traffic Management v2", o: "Bole Sub-City", s: "Approved", v: "success" },
              { t: "e-Permit Issuance Platform", o: "Arada Sub-City", s: "In review", v: "warning" },
              { t: "Citizen Feedback Portal", o: "ITDB Central", s: "Approved", v: "success" },
              { t: "Municipal Asset Tracker", o: "Kirkos Sub-City", s: "Rejected", v: "destructive" },
              { t: "Waste Routing AI", o: "Yeka Sub-City", s: "Pending", v: "warning" },
            ].map((r, i) => (
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
            {[
              { l: "Digital infrastructure", v: 82 },
              { l: "Cybersecurity maturity", v: 71 },
              { l: "Data interoperability", v: 64 },
              { l: "Citizen services digitization", v: 78 },
              { l: "Governance & compliance", v: 89 },
            ].map((p, i) => (
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
