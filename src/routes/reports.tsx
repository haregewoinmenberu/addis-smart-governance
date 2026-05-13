import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, FileText, Sparkles, TrendingUp, FileSpreadsheet, FileType2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports & Analytics — STRP" }] }),
  component: Page,
});

const procurement = [
  { q: "Q1", soft: 8.4, hard: 5.1, serv: 3.2 },
  { q: "Q2", soft: 9.1, hard: 6.0, serv: 3.6 },
  { q: "Q3", soft: 10.2, hard: 5.8, serv: 4.4 },
  { q: "Q4", soft: 11.6, hard: 7.2, serv: 5.1 },
];

const reports = [
  { t: "Citywide Technology Maturity Report", date: "Sep 14, 2025", type: "PDF", icon: FileType2 },
  { t: "FY25 Procurement Summary", date: "Sep 10, 2025", type: "Excel", icon: FileSpreadsheet },
  { t: "Cybersecurity Posture Briefing", date: "Sep 08, 2025", type: "PDF", icon: FileType2 },
  { t: "Sub-City Performance Index", date: "Sep 02, 2025", type: "Excel", icon: FileSpreadsheet },
  { t: "Vendor Risk & SLA Dashboard", date: "Aug 28, 2025", type: "PDF", icon: FileType2 },
];

function Page() {
  return (
    <AppShell>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Executive insights powered by AI across procurement, infrastructure and maturity."
        actions={<Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow"><Download className="h-4 w-4" />Generate report</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Reports generated" value="312" delta="+24" icon={FileText} accent="primary" />
        <StatCard label="Tech maturity" value="74.6" delta="+3.1" icon={TrendingUp} accent="success" />
        <StatCard label="AI insights" value="1,820" delta="+12%" icon={Sparkles} accent="info" />
        <StatCard label="Dashboards" value="46" delta="+5" icon={BarChart3} accent="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 p-5 rounded-2xl border-border/60">
          <h3 className="font-semibold tracking-tight mb-1">Procurement analytics</h3>
          <p className="text-xs text-muted-foreground mb-4">Spend by category (Billion ETB)</p>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={procurement} margin={{ left: -10, right: 8, top: 8 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="q" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="soft" stackId="s" fill="var(--color-primary)" name="Software" radius={[0, 0, 0, 0]} />
                <Bar dataKey="hard" stackId="s" fill="var(--color-info)" name="Hardware" />
                <Bar dataKey="serv" stackId="s" fill="var(--color-warning)" name="Services" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border-border/60 bg-gradient-to-br from-primary/5 via-card to-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow"><Sparkles className="h-4 w-4 text-primary-foreground" /></div>
            <h3 className="font-semibold tracking-tight text-sm">AI executive briefing</h3>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              "Procurement spend trending +12% QoQ — driven by software licenses.",
              "Bole and Yeka deliver the highest digital maturity index.",
              "Cybersecurity investment correlates with -22% incident drop.",
              "Vendor consolidation could unlock ETB 27M annual savings.",
            ].map((b, i) => <li key={i} className="leading-snug border-l-2 border-primary/40 pl-3">{b}</li>)}
          </ul>
        </Card>
      </div>

      <Card className="p-5 rounded-2xl border-border/60">
        <h3 className="font-semibold tracking-tight mb-4">Recent reports</h3>
        <div className="space-y-2">
          {reports.map((r) => (
            <div key={r.t} className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><r.icon className="h-4 w-4" /></div>
                <div>
                  <p className="text-sm font-medium">{r.t}</p>
                  <p className="text-xs text-muted-foreground">{r.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-muted/60 text-muted-foreground border-border/60">{r.type}</Badge>
                <Button variant="ghost" size="sm" className="gap-1.5"><Download className="h-4 w-4" />Download</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
