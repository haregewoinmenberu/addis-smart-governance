import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Can } from "@/components/rbac/Can";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getDashboard } from "@/lib/api";
import {
  Database, Activity, Clock, Copy, ShieldAlert, CheckCircle2,
  Building2, Sparkles, TrendingUp, ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip,
} from "recharts";

const statIcons = [
  Database, Activity, Clock, Copy, ShieldAlert, CheckCircle2, Building2, Sparkles,
];

/**
 * Auditor Dashboard
 * Compliance and evaluation focused view for ITDB / Sub-City auditors —
 * compliance distribution, smart-city readiness, and recent approvals.
 * Sections are permission-gated.
 */
export function AuditorDashboard() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  const stats = (data?.stats ?? []).map((item, index) => ({
    ...item,
    icon: statIcons[index] ?? Database,
  }));

  const compliance = data?.compliance ?? [];
  const readiness = data?.readiness ?? [];
  const approvals = data?.approvals ?? [];

  return (
    <>
      <PageHeader
        title="Auditor Dashboard"
        subtitle="Compliance, feasibility, and audit oversight across registered technology systems."
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Can permission={["view_audits", "view_cybersecurity"]}>
          <Card className="lg:col-span-2 p-5 rounded-2xl border-border/60">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold tracking-tight">Compliance Distribution</h3>
                <p className="text-xs text-muted-foreground">Across registered systems</p>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={compliance} dataKey="v" nameKey="name" innerRadius={60} outerRadius={92} paddingAngle={3}>
                    {compliance.map((d: { c: string }, i: number) => <Cell key={i} fill={d.c} />)}
                  </Pie>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Can>

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

      <Can permission={["view_requests", "view_all_requests"]}>
        <div className="grid grid-cols-1 gap-4 mt-4">
          <Card className="p-5 rounded-2xl border-border/60">
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
                  <span
                    className={
                      "text-[11px] rounded-full px-2 py-0.5 border " + (
                        r.v === "success" ? "bg-success/10 text-success border-success/20"
                        : r.v === "warning" ? "bg-warning/15 text-warning-foreground border-warning/30"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                      )
                    }
                  >{r.s}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Can>
    </>
  );
}
