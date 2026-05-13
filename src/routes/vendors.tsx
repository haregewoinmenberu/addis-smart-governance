import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Star, Ban, ShieldCheck, Search, Plus, Download } from "lucide-react";

export const Route = createFileRoute("/vendors")({
  head: () => ({ meta: [{ title: "Vendor Management — STRP" }] }),
  component: Page,
});

const vendors = [
  { n: "Sheba Tech PLC", cat: "Software", contracts: 14, sla: 96, score: 92, status: "Preferred" },
  { n: "AddisFlow Systems", cat: "IoT", contracts: 8, sla: 89, score: 84, status: "Active" },
  { n: "GreenOps", cat: "Cloud", contracts: 5, sla: 91, score: 86, status: "Active" },
  { n: "IoTAddis", cat: "IoT", contracts: 3, sla: 78, score: 71, status: "Watchlist" },
  { n: "DataCore Ethio", cat: "Data", contracts: 6, sla: 65, score: 58, status: "At risk" },
  { n: "HoraNet", cat: "Network", contracts: 9, sla: 94, score: 90, status: "Preferred" },
];

const stat = (s: string) =>
  s === "Preferred" ? "bg-primary/10 text-primary border-primary/20"
  : s === "Active" ? "bg-success/10 text-success border-success/20"
  : s === "Watchlist" ? "bg-warning/15 text-warning-foreground border-warning/30"
  : "bg-destructive/10 text-destructive border-destructive/20";

function Page() {
  return (
    <AppShell>
      <PageHeader
        title="Vendor Management"
        subtitle="Onboard, monitor and evaluate technology vendors with continuous SLA scoring."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" />Export</Button>
            <Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow"><Plus className="h-4 w-4" />Onboard vendor</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Registered vendors" value="186" delta="+9" icon={Building2} accent="primary" />
        <StatCard label="Avg. SLA compliance" value="89%" delta="+1.4%" icon={ShieldCheck} accent="success" />
        <StatCard label="Top performers" value="24" delta="+3" icon={Star} accent="info" />
        <StatCard label="Blacklisted" value="4" delta="0" icon={Ban} accent="destructive" />
      </div>

      <Card className="rounded-2xl border-border/60 overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <h3 className="font-semibold tracking-tight">Vendor directory</h3>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search vendors…" className="pl-9 bg-muted/40" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Vendor</th>
                <th className="text-left font-medium px-4 py-3">Category</th>
                <th className="text-left font-medium px-4 py-3">Contracts</th>
                <th className="text-left font-medium px-4 py-3">SLA</th>
                <th className="text-left font-medium px-4 py-3">Score</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.n} className="border-t border-border/60 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-primary text-primary-foreground flex items-center justify-center font-semibold">{v.n[0]}</div>
                      <span className="font-medium">{v.n}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{v.cat}</td>
                  <td className="px-4 py-3">{v.contracts}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden"><div className={v.sla >= 90 ? "h-full bg-success" : v.sla >= 80 ? "h-full bg-info" : v.sla >= 70 ? "h-full bg-warning" : "h-full bg-destructive"} style={{ width: `${v.sla}%` }} /></div>
                      <span className="text-xs">{v.sla}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{v.score}</td>
                  <td className="px-4 py-3"><Badge variant="secondary" className={stat(v.status)}>{v.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
