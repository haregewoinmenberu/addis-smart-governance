import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Layers, Sparkles, ArrowLeftRight, AlertTriangle, Wallet, TrendingDown } from "lucide-react";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

export const Route = createFileRoute("/duplication")({
  head: () => ({ meta: [{ title: "Duplication Analysis — STRP" }] }),
  component: Page,
});

const pairs = [
  { a: "Bole HRIS", b: "Yeka HRIS", score: 92, savings: "ETB 8.4M", recommend: "Consolidate" },
  { a: "Arada e-Permit", b: "Kirkos e-Permit", score: 87, savings: "ETB 5.1M", recommend: "Standardize" },
  { a: "Citywide CRM", b: "Sub-city Helpdesks (×4)", score: 78, savings: "ETB 11.2M", recommend: "Merge" },
  { a: "Asset Tracker A", b: "Asset Tracker B", score: 65, savings: "ETB 2.6M", recommend: "Review" },
];

function Page() {
  return (
    <AppShell>
      <PageHeader
        title="Duplication Analysis"
        subtitle="AI-powered detection of overlapping systems with consolidation and savings recommendations."
        actions={<Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow"><Sparkles className="h-4 w-4" />Run AI scan</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Duplicate clusters" value="19" delta="-3" trend="down" icon={Layers} accent="warning" />
        <StatCard label="High-similarity pairs" value="42" delta="+5" icon={ArrowLeftRight} accent="info" />
        <StatCard label="Potential savings" value="ETB 27.3M" delta="+12%" icon={Wallet} accent="success" />
        <StatCard label="Active alerts" value="7" delta="-2" trend="down" icon={AlertTriangle} accent="destructive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 rounded-2xl border-border/60 lg:col-span-1">
          <h3 className="font-semibold tracking-tight mb-1">Citywide duplication index</h3>
          <p className="text-xs text-muted-foreground mb-4">Lower is better</p>
          <div className="h-56">
            <ResponsiveContainer>
              <RadialBarChart innerRadius="60%" outerRadius="100%" data={[{ name: "Index", value: 32, fill: "var(--color-primary)" }]} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={20} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center -mt-32 mb-24">
            <div className="text-3xl font-semibold">32</div>
            <div className="text-xs text-success flex items-center justify-center gap-1 mt-1"><TrendingDown className="h-3 w-3" />-6 pts QoQ</div>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border-border/60 lg:col-span-2">
          <h3 className="font-semibold tracking-tight mb-4">High-similarity comparisons</h3>
          <div className="space-y-3">
            {pairs.map((p, i) => (
              <div key={i} className="rounded-xl border border-border/60 p-4 hover:border-primary/30 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <span>{p.a}</span>
                    <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                    <span>{p.b}</span>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{p.recommend}</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-center">
                  <div className="sm:col-span-2">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Similarity score</span>
                      <span className="font-semibold">{p.score}%</span>
                    </div>
                    <Progress value={p.score} className="h-2" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Estimated savings</p>
                    <p className="text-sm font-semibold text-success">{p.savings}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
