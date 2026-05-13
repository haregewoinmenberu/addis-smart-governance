import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Save, Globe, Bell, Lock, Plug, Palette, Workflow } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — STRP" }] }),
  component: Page,
});

function Row({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-border/60 last:border-0">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Page() {
  return (
    <AppShell>
      <PageHeader
        title="Settings"
        subtitle="Configure system policies, branding, integrations and notification preferences."
        actions={<Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow"><Save className="h-4 w-4" />Save changes</Button>}
      />

      <Tabs defaultValue="general">
        <TabsList className="bg-muted/40 p-1 rounded-xl mb-6 flex flex-wrap h-auto">
          <TabsTrigger value="general" className="gap-1.5"><Globe className="h-4 w-4" />General</TabsTrigger>
          <TabsTrigger value="branding" className="gap-1.5"><Palette className="h-4 w-4" />Branding</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5"><Lock className="h-4 w-4" />Security</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5"><Bell className="h-4 w-4" />Notifications</TabsTrigger>
          <TabsTrigger value="workflow" className="gap-1.5"><Workflow className="h-4 w-4" />Workflows</TabsTrigger>
          <TabsTrigger value="integrations" className="gap-1.5"><Plug className="h-4 w-4" />Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="p-6 rounded-2xl border-border/60">
            <h3 className="font-semibold tracking-tight mb-4">Organization</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div><Label>Authority name</Label><Input className="mt-1.5" defaultValue="Addis Ababa City ITDB" /></div>
              <div><Label>Default language</Label><Input className="mt-1.5" defaultValue="English (Amharic available)" /></div>
              <div><Label>Time zone</Label><Input className="mt-1.5" defaultValue="Africa/Addis_Ababa (UTC+3)" /></div>
              <div><Label>Fiscal year</Label><Input className="mt-1.5" defaultValue="Jul–Jun" /></div>
            </div>
            <Row title="Smart City Index AI module" desc="Continuously compute readiness across infrastructure & services."><Switch defaultChecked /></Row>
            <Row title="Public transparency portal" desc="Expose anonymized governance metrics to citizens."><Switch /></Row>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card className="p-6 rounded-2xl border-border/60">
            <h3 className="font-semibold tracking-tight mb-4">Brand identity</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow"><Sparkles className="h-7 w-7 text-primary-foreground" /></div>
              <div>
                <p className="font-medium">STRP Portal</p>
                <p className="text-xs text-muted-foreground">Primary color #147361 · Government green</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">Upload logo</Button>
            </div>
            <Row title="Dark mode default" desc="Apply dark theme to all new accounts."><Switch /></Row>
            <Row title="High contrast mode" desc="Improve accessibility for citizen-facing surfaces."><Switch /></Row>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6 rounded-2xl border-border/60">
            <h3 className="font-semibold tracking-tight mb-4">Security policies</h3>
            <Row title="Enforce SSO (OIDC)" desc="Require federated login for all government users."><Switch defaultChecked /></Row>
            <Row title="Multi-factor authentication" desc="Require MFA for Admins, Auditors and Approvers."><Switch defaultChecked /></Row>
            <Row title="Password rotation" desc="Force password change every 90 days."><Switch defaultChecked /></Row>
            <Row title="Session timeout" desc="Auto sign-out after 30 minutes of inactivity."><Badge variant="secondary">30 min</Badge></Row>
            <Row title="IP allowlist" desc="Restrict access to government network ranges."><Switch /></Row>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6 rounded-2xl border-border/60">
            <h3 className="font-semibold tracking-tight mb-4">Channel preferences</h3>
            <Row title="Email" desc="System updates and weekly briefings."><Switch defaultChecked /></Row>
            <Row title="SMS" desc="Critical alerts and approval requests."><Switch defaultChecked /></Row>
            <Row title="In-app" desc="Real-time toast and feed notifications."><Switch defaultChecked /></Row>
            <Row title="Webhook" desc="Forward events to integrated systems."><Switch /></Row>
          </Card>
        </TabsContent>

        <TabsContent value="workflow">
          <Card className="p-6 rounded-2xl border-border/60">
            <h3 className="font-semibold tracking-tight mb-4">Workflow defaults</h3>
            <Row title="Auto-escalate after 48h" desc="Re-route stalled approvals to next authority."><Switch defaultChecked /></Row>
            <Row title="Parallel approvals" desc="Allow concurrent reviewers on the same step."><Switch /></Row>
            <Row title="Require digital signature" desc="Mandate e-signature on final approval."><Switch defaultChecked /></Row>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card className="p-6 rounded-2xl border-border/60">
            <h3 className="font-semibold tracking-tight mb-4">Connected systems</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { n: "Citizen Identity Gateway", s: "Connected", c: "success" },
                { n: "Procurement ERP", s: "Connected", c: "success" },
                { n: "Geo-spatial GIS", s: "Configured", c: "info" },
                { n: "SMS Gateway · ETC", s: "Connected", c: "success" },
                { n: "AI Gateway · STRP-LLM", s: "Connected", c: "success" },
                { n: "Open Data Portal", s: "Pending", c: "warning" },
              ].map((i) => (
                <div key={i.n} className="flex items-center justify-between p-3 rounded-xl border border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Plug className="h-4 w-4" /></div>
                    <p className="text-sm font-medium">{i.n}</p>
                  </div>
                  <Badge variant="secondary" className={i.c === "success" ? "bg-success/10 text-success border-success/20" : i.c === "warning" ? "bg-warning/15 text-warning-foreground border-warning/30" : "bg-info/10 text-info border-info/20"}>{i.s}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
