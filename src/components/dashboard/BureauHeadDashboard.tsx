import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Users, FileStack, BookOpen, Microscope, Shield, Layers, ClipboardList,
  Network, Globe, ClipboardCheck, BarChart3, Settings, TrendingUp,
  ArrowRight, Activity, CheckCircle2, AlertCircle, Clock
} from "lucide-react";
import { getRoleDisplayName } from "@/lib/rbac";
import { ActivityLog } from "@/components/activity/ActivityLog";

interface QuickStatProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: string;
  variant?: "default" | "secondary" | "warning" | "danger";
}

function QuickStat({ icon: Icon, label, value, trend, variant = "default" }: QuickStatProps) {
  const variantColors = {
    default: "bg-primary/10 text-primary",
    secondary: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && (
              <p className="text-xs text-muted-foreground mt-1">{trend}</p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-xl ${variantColors[variant]} flex items-center justify-center`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickLinkProps {
  to: string;
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
}

function QuickLink({ to, icon: Icon, title, description, badge }: QuickLinkProps) {
  return (
    <Link to={to}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-primary text-primary-foreground flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold truncate">{title}</h4>
                {badge && <Badge variant="secondary" className="shrink-0">{badge}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function BureauHeadDashboard() {
  const { user } = useAuth();

  if (!user) return null;

  const permissionCount = user.permissions?.length || 0;
  const roleCount = user.roles?.length || 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.name.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground">
          You're logged in as <strong>{getRoleDisplayName(user)}</strong> with {permissionCount} permissions
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QuickStat
          icon={CheckCircle2}
          label="Active Requests"
          value="24"
          trend="+3 from yesterday"
          variant="secondary"
        />
        <QuickStat
          icon={Clock}
          label="Pending Approvals"
          value="12"
          trend="Requires attention"
          variant="warning"
        />
        <QuickStat
          icon={Activity}
          label="Active Projects"
          value="8"
          trend="2 due this week"
          variant="default"
        />
        <QuickStat
          icon={AlertCircle}
          label="Security Reviews"
          value="5"
          trend="1 critical"
          variant="danger"
        />
      </div>

      {/* Quick Access - Management */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Management</h2>
          <p className="text-sm text-muted-foreground">Quick access to key management functions</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickLink
            to="/users"
            icon={Users}
            title="User Management"
            description="Create, edit, and manage system users and their roles"
            badge="Admin"
          />
          <QuickLink
            to="/requests"
            icon={FileStack}
            title="Request Management"
            description="Review, approve, and assign technology requests"
            badge={`${permissionCount > 50 ? "Full Access" : ""}`}
          />
          <QuickLink
            to="/rbac"
            icon={Shield}
            title="RBAC Management"
            description="Manage roles, permissions, and access control"
            badge="Security"
          />
        </div>
      </div>

      {/* Quick Access - Operations */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Operations</h2>
          <p className="text-sm text-muted-foreground">Day-to-day operational functions</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickLink
            to="/training"
            icon={BookOpen}
            title="Training Programs"
            description="Manage training schedules, materials, and certifications"
          />
          <QuickLink
            to="/research/ideas"
            icon={Microscope}
            title="Research Management"
            description="Oversee research projects and innovation initiatives"
          />
          <QuickLink
            to="/security-review"
            icon={Shield}
            title="Security Reviews"
            description="Conduct security assessments and vulnerability scans"
          />
          <QuickLink
            to="/projects"
            icon={Layers}
            title="Project Management"
            description="Track projects, milestones, and deliverables"
          />
          <QuickLink
            to="/tasks"
            icon={ClipboardList}
            title="Task Management"
            description="Create and assign development tasks to teams"
          />
          <QuickLink
            to="/quality"
            icon={ClipboardCheck}
            title="Quality Management"
            description="Quality reviews, testing, and compliance verification"
          />
        </div>
      </div>

      {/* Quick Access - Infrastructure */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Infrastructure & IT</h2>
          <p className="text-sm text-muted-foreground">Infrastructure and IT operations</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickLink
            to="/infrastructure"
            icon={Network}
            title="Infrastructure"
            description="Manage network, servers, and firewall configurations"
          />
          <QuickLink
            to="/cloud"
            icon={Globe}
            title="Cloud Management"
            description="Provision cloud resources and manage deployments"
          />
          <QuickLink
            to="/tickets"
            icon={ClipboardList}
            title="Support Tickets"
            description="Track and resolve IT support tickets"
          />
        </div>
      </div>

      {/* Quick Access - Analytics & Settings */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Analytics & Administration</h2>
          <p className="text-sm text-muted-foreground">Reports, analytics, and system settings</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickLink
            to="/reports"
            icon={BarChart3}
            title="Reports & Analytics"
            description="Generate and export comprehensive system reports"
            badge="New"
          />
          <QuickLink
            to="/dashboard/executive"
            icon={TrendingUp}
            title="Executive Dashboard"
            description="High-level metrics and strategic insights"
          />
          <QuickLink
            to="/settings"
            icon={Settings}
            title="System Settings"
            description="Configure system settings and archive records"
          />
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current status of key system components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-medium">All Systems Operational</span>
              </div>
              <Badge variant="secondary">Online</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="font-medium">API Services</span>
              </div>
              <Badge variant="secondary">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="font-medium">Database</span>
              </div>
              <Badge variant="secondary">Connected</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role & Permissions Summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Access Summary</CardTitle>
            <CardDescription>Overview of your roles and permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Assigned Roles</h4>
              <div className="flex flex-wrap gap-2">
                {user.roles?.map((role) => (
                  <Badge key={role.name} variant="secondary" className="text-sm">
                    {getRoleDisplayName(role)}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Permission Categories</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border bg-card">
                  <p className="text-2xl font-bold text-primary">{permissionCount}</p>
                  <p className="text-xs text-muted-foreground">Total Permissions</p>
                </div>
                <div className="p-3 rounded-lg border bg-card">
                  <p className="text-2xl font-bold text-green-600">
                    {user.permissions?.filter(p => p.includes("view")).length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">View Permissions</p>
                </div>
                <div className="p-3 rounded-lg border bg-card">
                  <p className="text-2xl font-bold text-blue-600">
                    {user.permissions?.filter(p => p.includes("create") || p.includes("edit")).length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Edit Permissions</p>
                </div>
                <div className="p-3 rounded-lg border bg-card">
                  <p className="text-2xl font-bold text-purple-600">
                    {user.permissions?.filter(p => p.includes("approve") || p.includes("manage")).length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Admin Permissions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <ActivityLog limit={5} showTitle={true} />
      </div>
    </div>
  );
}
