import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, ShieldCheck, KeyRound, Plus, Search, Check, X } from "lucide-react";

export const Route = createFileRoute("/users")({
  head: () => ({ meta: [{ title: "User Management & RBAC — STRP" }] }),
  component: Page,
});

const users = [
  { n: "Abel Hailu", e: "abel.h@addisababa.gov.et", role: "Super Admin", sub: "ITDB", last: "5m ago", status: "Active" },
  { n: "Meron Tesfaye", e: "meron.t@addisababa.gov.et", role: "Auditor", sub: "Compliance", last: "1h ago", status: "Active" },
  { n: "Selam Bekele", e: "selam.b@bole.gov.et", role: "Sub-City Lead", sub: "Bole", last: "3h ago", status: "Active" },
  { n: "Liya Girma", e: "liya.g@yeka.gov.et", role: "Analyst", sub: "Yeka", last: "1d ago", status: "Active" },
  { n: "Sheba Tech", e: "ops@shebatech.et", role: "Vendor", sub: "External", last: "2d ago", status: "Suspended" },
];

const roles = ["Super Admin", "ITDB Officer", "Auditor", "Sub-City", "Vendor", "Analyst"];
const perms = ["View", "Create", "Approve", "Audit", "Export", "Manage Users"];
const matrix: Record<string, boolean[]> = {
  "Super Admin": [true, true, true, true, true, true],
  "ITDB Officer": [true, true, true, false, true, false],
  "Auditor": [true, false, false, true, true, false],
  "Sub-City": [true, true, false, false, false, false],
  "Vendor": [true, false, false, false, false, false],
  "Analyst": [true, false, false, false, true, false],
};

const roleBadge = (r: string) =>
  r === "Super Admin" ? "bg-primary/10 text-primary border-primary/20"
  : r === "Auditor" ? "bg-info/10 text-info border-info/20"
  : r === "Vendor" ? "bg-warning/15 text-warning-foreground border-warning/30"
  : "bg-muted text-muted-foreground";

function Page() {
  return (
    <AppShell>
      <PageHeader
        title="User Management & RBAC"
        subtitle="Role-based access for Super Admin, ITDB, Auditors, Sub-Cities, Vendors and Analysts."
        actions={<Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow"><Plus className="h-4 w-4" />Invite user</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total users" value="824" delta="+18" icon={Users} accent="primary" />
        <StatCard label="Active sessions" value="187" delta="+12" icon={ShieldCheck} accent="success" />
        <StatCard label="SSO enabled" value="96%" delta="+2%" icon={KeyRound} accent="info" />
        <StatCard label="Suspended" value="7" delta="-2" trend="down" icon={X} accent="destructive" />
      </div>

      <Card className="p-5 rounded-2xl border-border/60 mb-6">
        <h3 className="font-semibold tracking-tight mb-4">Permission matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left text-xs uppercase text-muted-foreground font-medium px-3 py-2">Role</th>
                {perms.map((p) => <th key={p} className="text-xs uppercase text-muted-foreground font-medium px-3 py-2">{p}</th>)}
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r} className="border-t border-border/60">
                  <td className="px-3 py-2.5 font-medium">{r}</td>
                  {matrix[r].map((ok, i) => (
                    <td key={i} className="px-3 py-2.5 text-center">
                      {ok ? <Check className="h-4 w-4 text-success inline" /> : <X className="h-4 w-4 text-muted-foreground/40 inline" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="rounded-2xl border-border/60 overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <h3 className="font-semibold tracking-tight">Users</h3>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users…" className="pl-9 bg-muted/40" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">User</th>
                <th className="text-left font-medium px-4 py-3">Role</th>
                <th className="text-left font-medium px-4 py-3">Department</th>
                <th className="text-left font-medium px-4 py-3">Last active</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.e} className="border-t border-border/60 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-semibold">{u.n.split(" ").map(x => x[0]).join("")}</div>
                      <div>
                        <p className="font-medium">{u.n}</p>
                        <p className="text-xs text-muted-foreground">{u.e}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="secondary" className={roleBadge(u.role)}>{u.role}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{u.sub}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.last}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className={u.status === "Active" ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}>{u.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
