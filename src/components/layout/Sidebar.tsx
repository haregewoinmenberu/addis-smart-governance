import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FileStack, ClipboardCheck, Database, ShieldCheck,
  Lock, Building2, GitBranch, BarChart3, MessageSquare, Bell,
  Users, Settings, ChevronLeft, Sparkles, Layers, Building, LogOut,
  Lightbulb, FlaskConical, TrendingUp, Award, BookOpen, Target,
  AlertTriangle, Copy, Search, ClipboardList, Handshake, Globe,
  Gavel, Microscope, FileText, Shield, Network,
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
  separator?: boolean;
  sectionLabel?: string;
}

const nav: NavItem[] = [
  // ── Dashboard ──────────────────────────────────────────────
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    permission: "view_dashboard",
    sectionLabel: "Overview",
  },

  // ── Institution Services (institutional users) ─────────────
  // {
  //   to: "/dashboard/institution?tab=request-service",
  //   label: "Request Service",
  //   icon: FileStack,
  //   permission: "view_institution_dashboard", 
  // },
  {
    to: "/dashboard/institution?tab=my-requests",
    label: "My Requests",
    icon: ClipboardCheck,
    permission: "view_institution_dashboard",
    sectionLabel: "Institution",
  },
  {
    to: "/dashboard/institution?tab=notifications",
    label: "My Notifications",
    icon: Bell,
    permission: "view_institution_dashboard",
    separator: true,
  },

  // ── Smart City Command Center ──────────────────────────────
  {
    to: "/dashboard/research",
    label: "Research Dashboard",
    icon: Microscope,
    permission: "view_research_dashboard",
    sectionLabel: "Smart City Command",
  },

  // ── Research Management ────────────────────────────────────
  {
    to: "/research/ideas",
    label: "Research Ideas",
    icon: Lightbulb,
    permissions: ["view-research-ideas", "create-research-ideas"],
    sectionLabel: "Research",
  },
  {
    to: "/research/screenings",
    label: "Screenings",
    icon: Target,
    permissions: ["view-research-screenings", "create-research-screenings"],
  },
  {
    to: "/research/projects",
    label: "Projects",
    icon: FlaskConical,
    permissions: ["view-research-projects", "manage-research-projects"],
  },
  {
    to: "/research/evaluations",
    label: "Evaluations",
    icon: TrendingUp,
    permissions: ["evaluate-research", "assess-trl"],
  },
  {
    to: "/research/transfers",
    label: "Tech Transfers",
    icon: Award,
    permissions: ["manage-technology-transfer", "approve-technology-transfer"],
  },
  {
    to: "/research/reports",
    label: "Research Reports",
    icon: BookOpen,
    permissions: ["view-research-reports", "view-research-analytics"],
    separator: true,
  },

  // ── Technology & Requests ──────────────────────────────────
  {
    to: "/requests",
    label: "Tech Requests",
    icon: FileStack,
    permission: "view_requests",
    sectionLabel: "Technology",
  },
  {
    to: "/service-requests",
    label: "Requests",
    icon: ClipboardList,
    permissions: ["view_requests", "view-research-ideas", "create-research-ideas"],
  },
  {
    to: "/registry",
    label: "Tech Registry",
    icon: Database,
    permission: "view_technologies",
  },
  {
    to: "/workflows",
    label: "Workflows",
    icon: GitBranch,
    permission: "view_workflows",
    separator: true,
  },

  // ── Governance & Compliance ────────────────────────────────
  {
    to: "/audit",
    label: "Audit",
    icon: ClipboardList,
    permission: "view_audits",
    sectionLabel: "Governance",
  },
  {
    to: "/cybersecurity",
    label: "Cybersecurity",
    icon: Shield,
    permission: "view_cybersecurity",
  },
  {
    to: "/feasibility",
    label: "Feasibility Studies",
    icon: Search,
    permission: "view_feasibility",
  },
  {
    to: "/duplication",
    label: "Duplication Cases",
    icon: Copy,
    permission: "view_duplication",
    separator: true,
  },

  // ── Institutions & Vendors ─────────────────────────────────
  {
    to: "/vendors",
    label: "Vendors",
    icon: Handshake,
    permission: "view_vendors",
    sectionLabel: "Partners",
  },
  {
    to: "/surveys",
    label: "Surveys",
    icon: MessageSquare,
    permission: "view_surveys",
    separator: true,
  },

  // ── Reports & Notifications ────────────────────────────────
  {
    to: "/reports",
    label: "Reports",
    icon: BarChart3,
    permission: "view_reports",
    sectionLabel: "Analytics",
  },
  {
    to: "/notifications",
    label: "Notifications",
    icon: Bell,
    permissions: ["view_notifications", "manage_notifications"],
    separator: true,
  },

  // ── Administration ─────────────────────────────────────────
  {
    to: "/users",
    label: "User Management",
    icon: Users,
    permission: "view_users",
    sectionLabel: "Administration",
  },
  {
    to: "/settings",
    label: "Settings",
    icon: Settings,
    permission: "view_settings",
  },
];

// Memoized nav item
const NavItem = memo(
  ({
    item,
    active,
    collapsed,
  }: {
    item: NavItem;
    active: boolean;
    collapsed: boolean;
  }) => {
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
        <Icon
          className={cn(
            "h-[18px] w-[18px] shrink-0",
            active ? "" : "text-muted-foreground group-hover:text-sidebar-accent-foreground",
          )}
        />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );
  }
);

NavItem.displayName = "NavItem";

export const Sidebar = memo(function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { hasPermission, hasAnyPermission, hasAllPermissions, isITDBAdmin, user } =
    usePermissions();
  const { logout } = useAuth();

  const hasAccess = useMemo(() => {
    return (item: NavItem): boolean => {
      if (item.adminOnly) return isITDBAdmin();
      if (item.to === "/notifications" && user?.user_type === "INSTITUTIONAL") {
        return false;
      }
      if (item.permission) return hasPermission(item.permission);
      if (item.permissions) {
        return item.requireAll
          ? hasAllPermissions(item.permissions)
          : hasAnyPermission(item.permissions);
      }
      return true;
    };
  }, [hasPermission, hasAnyPermission, hasAllPermissions, isITDBAdmin, user]);

  const visibleNavItems = useMemo(
    () => nav.filter(hasAccess),
    [hasAccess, user]
  );

  const isNavItemActive = (item: NavItem, currentPath: string): boolean => {
    const basePath = item.to.split("?")[0];
    if (basePath === "/dashboard") return currentPath === "/dashboard";
    if (item.to.includes("?")) {
      const [itemPath, itemQuery] = item.to.split("?");
      if (currentPath.startsWith(itemPath)) {
        return currentPath === itemPath && window.location.search.includes(itemQuery);
      }
      return false;
    }
    return currentPath.startsWith(basePath);
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 sticky top-0 h-screen",
        collapsed ? "w-[76px]" : "w-[268px]",
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
        <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight overflow-hidden">
            <span className="text-sm font-semibold tracking-tight truncate">STRP Portal</span>
            <span className="text-[11px] text-muted-foreground truncate">Addis Ababa ITDB</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-thin">
        {visibleNavItems.map((item, index) => {
          const active = isNavItemActive(item, path);
          const prevItem = visibleNavItems[index - 1];
          const showSectionLabel =
            !collapsed &&
            item.sectionLabel &&
            (index === 0 || prevItem?.separator || prevItem?.sectionLabel !== item.sectionLabel);

          return (
            <div key={item.to}>
              {/* Separator line */}
              {item.separator && !collapsed && index < visibleNavItems.length - 1 && (
                <div className="my-2 border-t border-sidebar-border/50" />
              )}
              {/* Section label */}
              {showSectionLabel && (
                <div className="px-3 pt-3 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {item.sectionLabel}
                </div>
              )}
              <NavItem item={item} active={active} collapsed={collapsed} />
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1 shrink-0">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <ChevronLeft className={cn("h-4 w-4 shrink-0 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
});
