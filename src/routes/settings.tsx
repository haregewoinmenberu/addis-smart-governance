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
import { SettingRow } from "@/components/settings/SettingRow";
import { Sparkles, Save, Globe, Bell, Lock, Plug, Palette, Workflow, RefreshCw, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — STRP" }] }),
  component: Page,
});

function Page() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Fetch settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  // Local state for form
  const [formData, setFormData] = useState<any>({
    general: {},
    branding: {},
    security: {},
    notifications: {},
    workflow: {},
  });

  // Update form data when settings are loaded
  useEffect(() => {
    if (settingsData) {
      setFormData(settingsData);
    }
  }, [settingsData]);

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setLastSaved(new Date());
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const updateField = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(settingsData);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["settings"] });
    toast({
      title: "Refreshed",
      description: "Settings reloaded from server",
    });
  };

  if (isLoading) {
    return (
      <AppShell>
        <PageHeader title="Settings" subtitle="Loading settings..." />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Settings"
        subtitle="Configure system policies, branding, integrations and notification preferences."
        actions={
          <div className="flex items-center gap-2">
            {lastSaved && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-success" />
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="gap-1.5"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <PermissionGuard permission="manage_settings">
              <Button
                size="sm"
                className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow"
                onClick={handleSave}
                disabled={updateMutation.isPending || !hasChanges()}
              >
                <Save className="h-4 w-4" />
                {updateMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </PermissionGuard>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
              <div>
                <Label>Authority name</Label>
                <Input
                  className="mt-1.5"
                  value={formData.general?.authority_name || ""}
                  onChange={(e) => updateField("general", "authority_name", e.target.value)}
                />
              </div>
              <div>
                <Label>Default language</Label>
                <Input
                  className="mt-1.5"
                  value={formData.general?.default_language || ""}
                  onChange={(e) => updateField("general", "default_language", e.target.value)}
                />
              </div>
              <div>
                <Label>Time zone</Label>
                <Input
                  className="mt-1.5"
                  value={formData.general?.timezone || ""}
                  onChange={(e) => updateField("general", "timezone", e.target.value)}
                />
              </div>
              <div>
                <Label>Fiscal year</Label>
                <Input
                  className="mt-1.5"
                  value={formData.general?.fiscal_year || ""}
                  onChange={(e) => updateField("general", "fiscal_year", e.target.value)}
                />
              </div>
            </div>
            <SettingRow
              title="Smart City Index AI module"
              description="Continuously compute readiness across infrastructure & services."
              value={formData.general?.smart_city_module}
              showStatus
            >
              <Switch
                checked={formData.general?.smart_city_module || false}
                onCheckedChange={(checked) => updateField("general", "smart_city_module", checked)}
              />
            </SettingRow>
            <SettingRow
              title="Public transparency portal"
              description="Expose anonymized governance metrics to citizens."
              value={formData.general?.public_portal}
              showStatus
            >
              <Switch
                checked={formData.general?.public_portal || false}
                onCheckedChange={(checked) => updateField("general", "public_portal", checked)}
              />
            </SettingRow>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card className="p-6 rounded-2xl border-border/60">
            <h3 className="font-semibold tracking-tight mb-4">Brand identity</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow"><Sparkles className="h-7 w-7 text-primary-foreground" /></div>
              <div>
                <p className="font-medium">STRP Portal</p>
                <p className="text-xs text-muted-foreground">Primary color {formData.branding?.primary_color || "#147361"} · Government green</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">Upload logo</Button>
            </div>
            <SettingRow
              title="Dark mode default"
              description="Apply dark theme to all new accounts."
              value={formData.branding?.dark_mode_default}
              showStatus
            >
              <Switch
                checked={formData.branding?.dark_mode_default || false}
                onCheckedChange={(checked) => updateField("branding", "dark_mode_default", checked)}
              />
            </SettingRow>
            <SettingRow
              title="High contrast mode"
              description="Improve accessibility for citizen-facing surfaces."
              value={formData.branding?.high_contrast}
              showStatus
            >
              <Switch
                checked={formData.branding?.high_contrast || false}
                onCheckedChange={(checked) => updateField("branding", "high_contrast", checked)}
              />
            </SettingRow>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6 rounded-2xl border-border/60">
            <h3 className="font-semibold tracking-tight mb-4">Security policies</h3>
            <SettingRow
              title="Enforce SSO (OIDC)"
              description="Require federated login for all government users."
              value={formData.security?.enforce_sso}
              showStatus
            >
              <Switch
                checked={formData.security?.enforce_sso || false}
                onCheckedChange={(checked) => updateField("security", "enforce_sso", checked)}
              />
            </SettingRow>
            <SettingRow
              title="Multi-factor authentication"
              description="Require MFA for Admins, Auditors and Approvers."
              value={formData.security?.require_mfa}
              showStatus
            >
              <Switch
                checked={formData.security?.require_mfa || false}
                onCheckedChange={(checked) => updateField("security", "require_mfa", checked)}
              />
            </SettingRow>
            <SettingRow
              title="Password rotation"
              description="Force password change periodically."
            >
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  className="w-20"
                  value={formData.security?.password_rotation_days || 90}
                  onChange={(e) => updateField("security", "password_rotation_days", parseInt(e.target.value))}
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </SettingRow>
            <SettingRow
              title="Session timeout"
              description="Auto sign-out after inactivity."
            >
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  className="w-20"
                  value={formData.security?.session_timeout_minutes || 30}
                  onChange={(e) => updateField("security", "session_timeout_minutes", parseInt(e.target.value))}
                />
                <span className="text-sm text-muted-foreground">min</span>
              </div>
            </SettingRow>
            <SettingRow
              title="IP allowlist"
              description="Restrict access to government network ranges."
              value={formData.security?.ip_allowlist_enabled}
              showStatus
            >
              <Switch
                checked={formData.security?.ip_allowlist_enabled || false}
                onCheckedChange={(checked) => updateField("security", "ip_allowlist_enabled", checked)}
              />
            </SettingRow>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6 rounded-2xl border-border/60">
            <h3 className="font-semibold tracking-tight mb-4">Channel preferences</h3>
            <SettingRow
              title="Email"
              description="System updates and weekly briefings."
              value={formData.notifications?.email_enabled}
              showStatus
            >
              <Switch
                checked={formData.notifications?.email_enabled || false}
                onCheckedChange={(checked) => updateField("notifications", "email_enabled", checked)}
              />
            </SettingRow>
            <SettingRow
              title="SMS"
              description="Critical alerts and approval requests."
              value={formData.notifications?.sms_enabled}
              showStatus
            >
              <Switch
                checked={formData.notifications?.sms_enabled || false}
                onCheckedChange={(checked) => updateField("notifications", "sms_enabled", checked)}
              />
            </SettingRow>
            <SettingRow
              title="In-app"
              description="Real-time toast and feed notifications."
              value={formData.notifications?.in_app_enabled}
              showStatus
            >
              <Switch
                checked={formData.notifications?.in_app_enabled || false}
                onCheckedChange={(checked) => updateField("notifications", "in_app_enabled", checked)}
              />
            </SettingRow>
            <SettingRow
              title="Webhook"
              description="Forward events to integrated systems."
              value={formData.notifications?.webhook_enabled}
              showStatus
            >
              <Switch
                checked={formData.notifications?.webhook_enabled || false}
                onCheckedChange={(checked) => updateField("notifications", "webhook_enabled", checked)}
              />
            </SettingRow>
          </Card>
        </TabsContent>

        <TabsContent value="workflow">
          <Card className="p-6 rounded-2xl border-border/60">
            <h3 className="font-semibold tracking-tight mb-4">Workflow defaults</h3>
            <SettingRow
              title="Auto-escalate after"
              description="Re-route stalled approvals to next authority."
            >
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  className="w-20"
                  value={formData.workflow?.auto_escalate_hours || 48}
                  onChange={(e) => updateField("workflow", "auto_escalate_hours", parseInt(e.target.value))}
                />
                <span className="text-sm text-muted-foreground">hours</span>
              </div>
            </SettingRow>
            <SettingRow
              title="Parallel approvals"
              description="Allow concurrent reviewers on the same step."
              value={formData.workflow?.parallel_approvals}
              showStatus
            >
              <Switch
                checked={formData.workflow?.parallel_approvals || false}
                onCheckedChange={(checked) => updateField("workflow", "parallel_approvals", checked)}
              />
            </SettingRow>
            <SettingRow
              title="Require digital signature"
              description="Mandate e-signature on final approval."
              value={formData.workflow?.require_signature}
              showStatus
            >
              <Switch
                checked={formData.workflow?.require_signature || false}
                onCheckedChange={(checked) => updateField("workflow", "require_signature", checked)}
              />
            </SettingRow>
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
