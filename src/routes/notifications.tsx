import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, MessageSquare, AlertTriangle, CheckCheck, Filter } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — STRP" }] }),
  component: Page,
});

const items = [
  { t: "Audit due in 3 days · Bole Sub-City", c: "Audit", lvl: "High", ago: "2m", read: false },
  { t: "New incident reported · IR-9821", c: "Cybersecurity", lvl: "Critical", ago: "12m", read: false },
  { t: "Vendor SLA breached · DataCore Ethio", c: "Vendor", lvl: "High", ago: "1h", read: false },
  { t: "Approval pending · Smart Traffic v2", c: "Workflow", lvl: "Medium", ago: "3h", read: true },
  { t: "Survey results published · Citizen CSAT", c: "Surveys", lvl: "Low", ago: "1d", read: true },
  { t: "Quarterly report ready", c: "Reports", lvl: "Low", ago: "2d", read: true },
];

const lvl = (l: string) =>
  l === "Critical" ? "bg-destructive/10 text-destructive border-destructive/20"
  : l === "High" ? "bg-warning/15 text-warning-foreground border-warning/30"
  : l === "Medium" ? "bg-info/10 text-info border-info/20"
  : "bg-muted text-muted-foreground";

function Page() {
  return (
    <AppShell>
      <PageHeader
        title="Notifications"
        subtitle="Real-time alerts, deadline reminders and multi-channel delivery status."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><Filter className="h-4 w-4" />Filter</Button>
            <Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground"><CheckCheck className="h-4 w-4" />Mark all read</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Unread" value="14" delta="+3" icon={Bell} accent="primary" />
        <StatCard label="Critical alerts" value="2" delta="0" icon={AlertTriangle} accent="destructive" />
        <StatCard label="Email delivered" value="98.7%" delta="+0.4%" icon={Mail} accent="success" />
        <StatCard label="SMS delivered" value="96.1%" delta="+1.1%" icon={MessageSquare} accent="info" />
      </div>

      <Card className="p-5 rounded-2xl border-border/60">
        <h3 className="font-semibold tracking-tight mb-4">Activity feed</h3>
        <div className="space-y-1">
          {items.map((n, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${n.read ? "border-border/40 opacity-70" : "border-border/60 bg-primary/[0.03]"}`}>
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${n.read ? "bg-muted-foreground/40" : "bg-primary animate-pulse"}`} />
                <div>
                  <p className="text-sm font-medium">{n.t}</p>
                  <p className="text-xs text-muted-foreground">{n.c} · {n.ago} ago</p>
                </div>
              </div>
              <Badge variant="secondary" className={lvl(n.lvl)}>{n.lvl}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
