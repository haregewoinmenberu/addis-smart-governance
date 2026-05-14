import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { getVendors } from "@/lib/api";
import { Building2, Star, Ban, ShieldCheck, Search, Plus, Download } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/vendors/")({
  head: () => ({ meta: [{ title: "Vendor Management — STRP" }] }),
  component: () => (
    <RequireAuth>
      <Page />
    </RequireAuth>
  ),
});

interface Vendor {
  id: number;
  name: string;
  status: string;
  score: number;
  active_projects: number;
  sla_breaches: number;
  last_reviewed_at: string;
}

const stat = (s: string) =>
  s === "Preferred" ? "bg-primary/10 text-primary border-primary/20"
  : s === "Active" ? "bg-success/10 text-success border-success/20"
  : s === "Watchlist" ? "bg-warning/15 text-warning-foreground border-warning/30"
  : "bg-destructive/10 text-destructive border-destructive/20";

function Page() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => getVendors(),
  });

  const vendors = data?.data ?? [];

  // Calculate statistics
  const totalVendors = vendors.length;
  const preferredVendors = vendors.filter(v => v.status === "Preferred").length;
  const atRiskVendors = vendors.filter(v => v.status === "At risk").length;
  const avgScore = vendors.length > 0
    ? Math.round(vendors.reduce((sum, v) => sum + v.score, 0) / vendors.length)
    : 0;

  // Filter vendors by search term
  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppShell>
      <PageHeader
        title="Vendor Management"
        subtitle="Onboard, monitor and evaluate technology vendors with continuous SLA scoring."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" />Export</Button>
            <Link to="/vendors/create">
              <Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow">
                <Plus className="h-4 w-4" />Onboard vendor
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Registered vendors" value={totalVendors.toString()} delta="" icon={Building2} accent="primary" />
        <StatCard label="Avg. vendor score" value={`${avgScore}%`} delta="" icon={ShieldCheck} accent="success" />
        <StatCard label="Top performers" value={preferredVendors.toString()} delta="" icon={Star} accent="info" />
        <StatCard label="At risk" value={atRiskVendors.toString()} delta="" icon={Ban} accent="destructive" />
      </div>

      <Card className="rounded-2xl border-border/60 overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <h3 className="font-semibold tracking-tight">Vendor directory</h3>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors…"
              className="pl-9 bg-muted/40"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading vendors...</div>
          ) : filteredVendors.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No vendors found</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Vendor</th>
                  <th className="text-left font-medium px-4 py-3">Active Projects</th>
                  <th className="text-left font-medium px-4 py-3">SLA Breaches</th>
                  <th className="text-left font-medium px-4 py-3">Score</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-left font-medium px-4 py-3">Last Reviewed</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((v) => (
                  <tr key={v.id} className="border-t border-border/60 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-primary text-primary-foreground flex items-center justify-center font-semibold">{v.name[0]}</div>
                        <span className="font-medium">{v.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{v.active_projects}</td>
                    <td className="px-4 py-3">
                      <span className={v.sla_breaches > 0 ? "text-destructive font-medium" : "text-muted-foreground"}>
                        {v.sla_breaches}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                          <div
                            className={v.score >= 90 ? "h-full bg-success" : v.score >= 80 ? "h-full bg-info" : v.score >= 70 ? "h-full bg-warning" : "h-full bg-destructive"}
                            style={{ width: `${v.score}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold">{v.score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="secondary" className={stat(v.status)}>{v.status}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(v.last_reviewed_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </AppShell>
  );
}
