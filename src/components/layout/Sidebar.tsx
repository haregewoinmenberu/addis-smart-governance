import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FileStack, ClipboardCheck, Database, ShieldCheck,
  Lock, Building2, GitBranch, BarChart3, MessageSquare, Bell,
  Users, Settings, ChevronLeft, Sparkles, Layers, Building, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo, memo } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import type { PermissionName } from "@/types/rbac";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  permission?: PermissionName;
  permissions?: PermissionName[];
  requireAll?: boolean;
  adminOnly?: boolean;
}

const nav: NavItem[] = [
  { 
    to: "/", 
    label: "Dashboard", 
    icon: LayoutDashboard,
    permission: "view_dashboard"
  },
  { 
    to: "/requests", 
    label: "Technology Requests", 
    icon: FileStack,
    permission: "view_requests"
  },
  { 
    to: "/duplication", 
    label: "Duplication Analysis", 
    icon: Layers,
    permission: "view_duplication"
  },
  { 
    to: "/feasibility", 
    label: "Feasibility Studies", 
    icon: ClipboardCheck,
    permission: "view_feasibility"
  },
  { 
    to: "/registry", 
    label: "Technology Registry", 
    icon: Database,
    permission: "view_technologies"
  },
  { 
    to: "/audit", 
    label: "Audit & Compliance", 
    icon: ShieldCheck,
    permission: "view_audits"
  },
  { 
    to: "/cybersecurity", 
    label: "Cybersecurity", 
    icon: Lock,
    permission: "view_cybersecurity"
  },
  { 
    to: "/vendors", 
    label: "Vendor Management", 
    icon: Building2,
    permission: "view_vendors"
  },
  { 
    to: "/workflows", 
    label: "Approval Workflows", 
    icon: GitBranch,
    permission: "view_workflows"
  },
  { 
    to: "/reports", 
    label: "Reports & Analytics", 
    icon: BarChart3,
    permission: "view_reports"
  },
  { 
    to: "/surveys", 
    label: "Surveys & Feedback", 
    icon: MessageSquare,
    permission: "view_surveys"
  },
  { 
    to: "/notifications", 
    label: "Notifications", 
    icon: Bell,
    permission: "view_notifications"
  },
  { 
    to: "/sub-cities", 
    label: "Sub-Cities", 
    icon: Building,
    adminOnly: true
  },
  { 
    to: "/users", 
    label: "User Management", 
    icon: Users,
    permission: "view_users"
  },
  { 
    to: "/settings", 
    label: "Settings", 
    icon: Settings,
    permission: "view_settings"
  },
];

// Memoized navigation item component to prevent re-renders
const NavItem = memo(({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
        active
          ? "bg-gradient-primary text-primary-foreground shadow-glow"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "" : "text-muted-foreground group-hover:text-sidebar-accent-foreground")} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
});

NavItem.displayName = "NavItem";

export const Sidebar = memo(function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { hasPermission, hasAnyPermission, hasAllPermissions, isITDBAdmin, user } = usePermissions();
  const { logout } = useAuth();

  /**
   * Check if user has access to a navigation item
   * Memoized to prevent recalculation on every render
   */
  const hasAccess = useMemo(() => {
    return (item: NavItem): boolean => {
      // Admin-only items
      if (item.adminOnly) {
        return isITDBAdmin();
      }

      // Single permission check
      if (item.permission) {
        return hasPermission(item.permission);
      }

      // Multiple permissions check
      if (item.permissions) {
        return item.requireAll
          ? hasAllPermissions(item.permissions)
          : hasAnyPermission(item.permissions);
      }

      // No permission required - show to all authenticated users
      return true;
    };
  }, [hasPermission, hasAnyPermission, hasAllPermissions, isITDBAdmin]);

  // Filter navigation items based on permissions
  // Memoized to prevent recalculation on every render
  const visibleNavItems = useMemo(() => {
    return nav.filter(hasAccess);
  }, [hasAccess, user]); // Only recalculate when user changes

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 sticky top-0 h-screen",
        collapsed ? "w-[76px]" : "w-[268px]",
      )}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">STRP Portal</span>
            <span className="text-[11px] text-muted-foreground">Addis Ababa ITDB</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {visibleNavItems.map((item) => {
          const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
          return (
            <NavItem
              key={item.to}
              item={item}
              active={active}
              collapsed={collapsed}
            />
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Log out</span>}
        </button>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
});
