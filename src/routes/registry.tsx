import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Database, Server, ShieldCheck, MapPin, Search, Filter, Download, Plus, Globe2, Cpu, Cloud, HardDrive } from "lucide-react";

export const Route = createFileRoute("/registry")({
  head: () => ({ meta: [{ title: "Technology Registry — STRP" }] }),
  component: Page,
});

const assets = [
  { id: "TR-AS-2014", name: "Citizen ID Platform", owner: "ITDB Central", env: "Cloud", class: "Critical", status: "Operational", license: "Perpetual", vendor: "Sheba Tech" },
  { id: "TR-AS-2013", name: "Smart Traffic Hub", owner: "Bole Sub-City", env: "Hybrid", class: "High", status: "Operational", license: "SaaS", vendor: "AddisFlow" },
  { id: "TR-AS-2012", name: "e-Permit Service", owner: "Arada Sub-City", env: "On-Prem", class: "Medium", status: "Maintenance", license: "OSS", vendor: "Internal" },
  { id: "TR-AS-2011", name: "Waste Routing AI", owner: "Yeka Sub-City", env: "Cloud", class: "High", status: "Operational", license: "SaaS", vendor: "GreenOps" },
  { id: "TR-AS-2010", name: "Municipal HRIS", owner: "ITDB Central", env: "Cloud", class: "Medium", status: "Operational", license: "Subscription", vendor: "Workforce.et" },
  { id: "TR-AS-2009", name: "Asset Tracker IoT", owner: "Kirkos Sub-City", env: "Edge", class: "Low", status: "Pilot", license: "Trial", vendor: "IoTAddis" },
];

const cls = (c: string) =>
  c === "Critical" ? "bg-destructive/10 text-destructive border-destructive/20"
  : c === "High" ? "bg-warning/15 text-warning-foreground border-warning/30"
  : c === "Medium" ? "bg-info/10 text-info border-info/20"
  : "bg-muted text-muted-foreground";

const envIcon = (e: string) => e === "Cloud" ? Cloud : e === "On-Prem" ? Server : e === "Edge" ? Cpu : HardDrive;

function Page() {
  return (
    <AppShell>
      <PageHeader
        title="Technology Registry"
        subtitle="Centralized inventory of every technology asset deployed across Addis Ababa."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" />Export</Button>
            <Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow"><Plus className="h-4 w-4" />Register asset</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total assets" value="1,284" delta="+8.2%" icon={Database} accent="primary" />
        <StatCard label="Operational" value="1,196" delta="+2.1%" icon={ShieldCheck} accent="success" />
        <StatCard label="Cloud-hosted" value="742" delta="+11%" icon={Cloud} accent="info" />
        <StatCard label="Sub-cities covered" value="11 / 11" delta="100%" icon={Globe2} accent="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 p-5 rounded-2xl border-border/60 overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold tracking-tight">Asset inventory</h3>
              <p className="text-xs text-muted-foreground">Filter, classify and audit every registered system</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search…" className="pl-9 h-9 w-56 bg-muted/40" />
              </div>
              <Button variant="outline" size="sm" className="gap-1.5"><Filter className="h-4 w-4" />Filters</Button>
            </div>
          </div>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-5 py-3">Asset</th>
                  <th className="text-left font-medium px-3 py-3">Owner</th>
                  <th className="text-left font-medium px-3 py-3">Environment</th>
                  <th className="text-left font-medium px-3 py-3">Classification</th>
                  <th className="text-left font-medium px-3 py-3">Status</th>
                  <th className="text-left font-medium px-5 py-3">Vendor</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((a) => {
                  const Icon = envIcon(a.env);
                  return (
                    <tr key={a.id} className="border-t border-border/60 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Database className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{a.name}</p>
                            <p className="text-xs text-muted-foreground">{a.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{a.owner}</td>
                      <td className="px-3 py-3"><span className="inline-flex items-center gap-1.5 text-xs"><Icon className="h-3.5 w-3.5 text-muted-foreground" />{a.env}</span></td>
                      <td className="px-3 py-3"><Badge variant="secondary" className={cls(a.class)}>{a.class}</Badge></td>
                      <td className="px-3 py-3 text-xs">{a.status}</td>
                      <td className="px-5 py-3 text-muted-foreground">{a.vendor}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border-border/60">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="font-semibold tracking-tight">Deployment map</h3>
          </div>
          <div className="aspect-square rounded-xl bg-gradient-to-br from-primary/10 via-info/5 to-card border border-border/60 relative overflow-hidden">
            <div className="absolute inset-0 [background-image:linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
            {[
              { x: "30%", y: "40%", s: "Bole" }, { x: "55%", y: "30%", s: "Yeka" },
              { x: "45%", y: "55%", s: "Kirkos" }, { x: "65%", y: "60%", s: "Arada" },
              { x: "25%", y: "70%", s: "Lideta" }, { x: "75%", y: "45%", s: "Gulele" },
            ].map((p) => (
              <div key={p.s} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: p.x, top: p.y }}>
                <div className="relative">
                  <div className="absolute inset-0 h-3 w-3 rounded-full bg-primary animate-ping opacity-60" />
                  <div className="h-3 w-3 rounded-full bg-gradient-primary shadow-glow" />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-medium text-foreground/80 whitespace-nowrap">{p.s}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Live deployments across 11 sub-cities</p>
        </Card>
      </div>
    </AppShell>
  );
}
