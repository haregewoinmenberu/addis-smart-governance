import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter, Search, FileStack, ArrowRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/requests")({
  head: () => ({ meta: [{ title: "Technology Requests — STRP" }] }),
  component: Page,
});

const requests = [
  { id: "TR-2025-0142", title: "Smart Traffic Management v2", office: "Bole Sub-City", status: "In review", step: 3, total: 5, budget: "ETB 12.4M", date: "Sep 12, 2025" },
  { id: "TR-2025-0141", title: "Citizen Feedback Mobile App", office: "ITDB Central", status: "Approved", step: 5, total: 5, budget: "ETB 4.8M", date: "Sep 10, 2025" },
  { id: "TR-2025-0140", title: "Municipal Asset Tracker", office: "Kirkos Sub-City", status: "Rejected", step: 4, total: 5, budget: "ETB 9.1M", date: "Sep 09, 2025" },
  { id: "TR-2025-0139", title: "Waste Routing AI Platform", office: "Yeka Sub-City", status: "Pending", step: 1, total: 5, budget: "ETB 18.7M", date: "Sep 08, 2025" },
  { id: "TR-2025-0138", title: "e-Permit Issuance Portal", office: "Arada Sub-City", status: "In review", step: 2, total: 5, budget: "ETB 7.6M", date: "Sep 06, 2025" },
];

const statusStyle = (s: string) => {
  if (s === "Approved") return "bg-success/10 text-success border-success/20";
  if (s === "Rejected") return "bg-destructive/10 text-destructive border-destructive/20";
  if (s === "In review") return "bg-info/10 text-info border-info/20";
  return "bg-warning/15 text-warning-foreground border-warning/30";
};

function Page() {
  return (
    <AppShell>
      <PageHeader
        title="Technology Requests"
        subtitle="Submit, track and manage technology procurement and deployment requests across the city."
        actions={
          <Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow">
            <Plus className="h-4 w-4" />New request
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { l: "Pending review", v: "47", i: Clock, c: "bg-warning/15 text-warning-foreground" },
          { l: "Approved this month", v: "128", i: CheckCircle2, c: "bg-success/10 text-success" },
          { l: "Action required", v: "9", i: AlertCircle, c: "bg-destructive/10 text-destructive" },
        ].map((s) => (
          <Card key={s.l} className="p-5 rounded-2xl border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.l}</p>
                <p className="text-2xl font-semibold mt-1">{s.v}</p>
              </div>
              <s.i className={`h-9 w-9 p-2 rounded-xl ${s.c}`} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-border/60 overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search requests…" className="pl-9 bg-muted/40" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5"><Filter className="h-4 w-4" />Filters</Button>
            <Button variant="outline" size="sm">All statuses</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Request</th>
                <th className="text-left font-medium px-4 py-3">Office</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-left font-medium px-4 py-3">Stage</th>
                <th className="text-left font-medium px-4 py-3">Budget</th>
                <th className="text-left font-medium px-4 py-3">Submitted</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-t border-border/60 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <FileStack className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{r.title}</p>
                        <p className="text-xs text-muted-foreground">{r.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.office}</td>
                  <td className="px-4 py-3"><Badge variant="secondary" className={statusStyle(r.status)}>{r.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-gradient-primary" style={{ width: `${(r.step / r.total) * 100}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{r.step}/{r.total}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{r.budget}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.date}</td>
                  <td className="px-4 py-3 text-right"><Button variant="ghost" size="icon" className="h-8 w-8"><ArrowRight className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
