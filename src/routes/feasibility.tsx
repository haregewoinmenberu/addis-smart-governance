import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ClipboardCheck,
  Cpu,
  DollarSign,
  ShieldCheck,
  Users,
  Plus,
  FileSearch,
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

export const Route = createFileRoute("/feasibility")({
  head: () => ({ meta: [{ title: "Feasibility Studies — STRP" }] }),
  component: Page,
});

const radar = [
  { k: "Technical", v: 82 },
  { k: "Financial", v: 71 },
  { k: "Security", v: 88 },
  { k: "Operational", v: 76 },
  { k: "Vendor", v: 64 },
  { k: "Risk", v: 70 },
];

const swot = [
  {
    t: "Strengths",
    cls: "border-success/20 bg-success/5 text-success",
    items: ["Strong vendor reputation", "Open APIs available", "ETB 4M cost saving vs alt."],
  },
  {
    t: "Weaknesses",
    cls: "border-warning/30 bg-warning/10 text-warning-foreground",
    items: ["Limited internal Kubernetes skills", "Moderate vendor lock-in"],
  },
  {
    t: "Opportunities",
    cls: "border-info/20 bg-info/5 text-info",
    items: ["Reuse for 4 sub-cities", "Foundation for citizen ID linkage"],
  },
  {
    t: "Threats",
    cls: "border-destructive/20 bg-destructive/5 text-destructive",
    items: ["FX volatility on licensing", "Regional cybersecurity escalation"],
  },
];

const studies = [
  {
    id: "FS-228",
    t: "Citywide Smart Lighting",
    o: "Bole Sub-City",
    score: 84,
    status: "Approved",
  },
  {
    id: "FS-227",
    t: "AI Waste Optimization",
    o: "Yeka Sub-City",
    score: 76,
    status: "In review",
  },
  {
    id: "FS-226",
    t: "Digital Land Records v2",
    o: "ITDB Central",
    score: 68,
    status: "In review",
  },
  {
    id: "FS-225",
    t: "Public Wi-Fi Mesh",
    o: "Arada Sub-City",
    score: 59,
    status: "Revisions",
  },
];

function Page() {
  return (
    <AppShell>
      <PageHeader
        title="Feasibility Studies"
        subtitle="Evaluate technical, financial, security and operational viability of every initiative."
        actions={
          <Button
            size="sm"
            className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow"
          >
            <Plus className="h-4 w-4" />
            New study
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active studies" value="34" delta="+6" icon={FileSearch} accent="primary" />
        <StatCard
          label="Avg. feasibility"
          value="74 / 100"
          delta="+2.1"
          icon={ClipboardCheck}
          accent="info"
        />
        <StatCard
          label="Approved this quarter"
          value="18"
          delta="+4"
          icon={ShieldCheck}
          accent="success"
        />
        <StatCard
          label="Projected ROI"
          value="2.4×"
          delta="+0.3"
          icon={DollarSign}
          accent="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 rounded-2xl border-border/60 lg:col-span-1">
          <h3 className="font-semibold tracking-tight mb-4">Multi-dimensional evaluation</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart data={radar}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis
                  dataKey="k"
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar
                  dataKey="v"
                  stroke="var(--color-primary)"
                  fill="var(--color-primary)"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border-border/60 lg:col-span-2">
          <h3 className="font-semibold tracking-tight mb-4">SWOT analysis · Smart Lighting</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {swot.map((s) => (
              <div key={s.t} className={`rounded-xl border p-4 ${s.cls}`}>
                <p className="text-xs uppercase tracking-wide font-semibold mb-2">{s.t}</p>
                <ul className="space-y-1.5">
                  {s.items.map((i) => (
                    <li key={i} className="text-sm leading-snug">
                      • {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5 rounded-2xl border-border/60">
        <h3 className="font-semibold tracking-tight mb-4">Recent studies</h3>
        <div className="space-y-3">
          {studies.map((s) => (
            <div
              key={s.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-3 rounded-xl border border-border/60 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Cpu className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{s.t}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.id} · {s.o}
                  </p>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Score</span>
                  <span className="font-semibold">{s.score}/100</span>
                </div>
                <Progress value={s.score} className="h-1.5" />
              </div>
              <Badge
                variant="secondary"
                className={
                  s.status === "Approved"
                    ? "bg-success/10 text-success border-success/20"
                    : s.status === "Revisions"
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-info/10 text-info border-info/20"
                }
              >
                {s.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
