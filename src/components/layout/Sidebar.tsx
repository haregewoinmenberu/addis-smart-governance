import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FileStack, ClipboardCheck, Database, ShieldCheck,
  Lock, Building2, GitBranch, BarChart3, MessageSquare, Bell,
  Users, Settings, ChevronLeft, Sparkles, Layers, LogOut,
  Lightbulb, FlaskConical, TrendingUp, Award, BookOpen, Target,
  AlertTriangle, ClipboardList, FileText, Shield, Network, ChevronDown, ChevronRight,
  Calendar, Cloud, Server, Zap, TestTube, FileCheck, Download, Microscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo, memo } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import type { PermissionName } from "@/types/rbac";

interface NavItem {
  to?: string;
  label: string;
  icon: React.ElementType;
  permission?: PermissionName;
  permissions?: PermissionName[];
  requireAll?: boolean;
  adminOnly?: boolean;
  separator?: boolean;
  sectionLabel?: string;
  children?: NavItem[];
}

const nav: NavItem[] = [
  // ── Institution Portal (for INSTITUTIONAL users only) ──────
  {
    label: "My Institution",
    icon: Building2,
    sectionLabel: "Institution Portal",
    permission: "view_institution_dashboard",
    children: [
      {
        to: "/dashboard/institution?tab=my-requests",
        label: "My Requests",
        icon: ClipboardCheck,
        permission: "view_institution_dashboard",
      },
      {
        to: "/dashboard/institution?tab=notifications",
        label: "My Notifications",
        icon: Bell,
        permission: "view_institution_dashboard",
      },
      {
        to: "/tickets",
        label: "Open Support Ticket",
        icon: MessageSquare,
        permission: "view_institution_dashboard",
        // No permission required - all authenticated users can create tickets
      },
    ],
  },

  // ── Research Director Portal (for research_director role only) ──────
  {
    to: "/dashboard/main",
    label: "Dashboard",
    icon: LayoutDashboard,
    sectionLabel: "Research Director",
    permission: "view_research",
  },
  
  {
    label: "Research",
    icon: Microscope,
    sectionLabel: "Research Director",
    children: [
      {
        to: "/research/ideas/director",
        label: "Research Ideas",
        icon: Lightbulb,
        permission: "view_research",
      },
      {
        to: "/requests/assigned",
        label: "Assigned Requests",
        icon: Target,
        permission: "view_research",
      },
      {
        to: "/research/reports",
        label: "Research Reports",
        icon: FileText,
        permission: "view_research",
      },
    ],
  },
  
  {
    label: "Analytics & Reports",
    icon: BarChart3,
    sectionLabel: "Research Director",
    children: [
      {
        to: "/reports",
        label: "Reports",
        icon: BarChart3,
        permission: "view_reports",
      },
    ],
  },
  
  {
    label: "Management",
    icon: Settings,
    sectionLabel: "Research Director",
    children: [
      {
        to: "/users",
        label: "User Management",
        icon: Users,
        permission: "view_users",
        children: [
          {
            to: "/users",
            label: "Users",
            icon: Users,
            permission: "view_users",
          },
        ],
      },
      {
        to: "/notifications",
        label: "Notifications",
        icon: Bell,
        permission: "view_notifications",
      },
    ],
  },

  // ── Dashboards ──────────────────────────────────────────────
  {
    label: "Dashboards",
    icon: LayoutDashboard,
    sectionLabel: "Dashboards",
    children: [
      {
        to: "/dashboard/main",
        label: "Main Dashboard",
        icon: LayoutDashboard,
        permission: "view_dashboard",
      },
      {
        to: "/dashboard/executive",
        label: "Executive Dashboard",
        icon: Sparkles,
        permission: "view_executive_dashboard",
      },
      {
        to: "/reports",
        label: "Reports Dashboard",
        icon: BarChart3,
        permission: "view_reports_dashboard",
      },
    ],
  }, 

  // ── Training Management ────────────────────────────────────
  {
    label: "Training Management",
    icon: BookOpen,
    children: [
      {
        to: "/training",
        label: "Training Programs",
        icon: BookOpen,
        permission: "view_training",
      },
      {
        to: "/training/schedule",
        label: "Training Schedule",
        icon: Calendar,
        permission: "schedule_training",
      },
      {
        to: "/training/certificates",
        label: "Certificates",
        icon: Award,
        permission: "generate_certificate",
      },
    ],
  },

  // ── Research & Innovation ───────────────────────────────────
  {
    label: "Research & Innovation",
    icon: Microscope,
    children: [
      {
        to: "/service-requests",
        label: "Service Requests",
        icon: FileStack,
        permission: "receive_requests",
      },
      {
        to: "/research/ideas",
        label: "Research Ideas",
        icon: Lightbulb,
        permission: "view_research",
      },
      {
        to: "/research/screenings",
        label: "Idea Screening",
        icon: Target,
        permission: "conduct_research",
      }, 
      {
        to: "/research/transfers",
        label: "Technology Transfer",
        icon: Award,
        permission: "forward_project",
      },
      {
        to: "/research/reports",
        label: "Research Reports",
        icon: FileText,
        permission: "view_research",
      },
    ],
  },

  // ── Cyber Security ─────────────────────────────────────────
  {
    label: "Cyber Security",
    icon: Shield,
    children: [
      {
        to: "/security-review",
        label: "Security Reviews",
        icon: Shield,
        permission: "view_security_review",
      },
      {
        to: "/security-review/assessments",
        label: "Security Assessments",
        icon: ShieldCheck,
        permission: "security_assessment",
      },
      {
        to: "/security-review/vulnerabilities",
        label: "Vulnerability Scans",
        icon: AlertTriangle,
        permission: "vulnerability_assessment",
      },
      {
        to: "/security-review/clearances",
        label: "Security Clearances",
        icon: Lock,
        permission: "issue_security_clearance",
      },
    ],
  },

  // ── Project Management ─────────────────────────────────────
  {
    label: "Project Management",
    icon: Layers,
    children: [
      {
        to: "/projects",
        label: "Projects",
        icon: Layers,
        permission: "view_projects",
      },
      {
        to: "/projects/milestones",
        label: "Milestones",
        icon: Target,
        permission: "approve_milestone",
      },
      {
        to: "/projects/deliverables",
        label: "Deliverables",
        icon: FileCheck,
        permission: "approve_deliverable",
      },
      {
        to: "/tasks",
        label: "Tasks",
        icon: ClipboardList,
        permission: "create_tasks",
      },
      {
        to: "/tasks/assignments",
        label: "Task Assignments",
        icon: Users,
        permission: "assign_tasks",
      },
      {
        to: "/development/code-reviews",
        label: "Code Reviews",
        icon: GitBranch,
        permission: "review_code",
      },
      {
        to: "/development/releases",
        label: "Releases",
        icon: Award,
        permission: "approve_release",
      },
    ],
  },

  // ── Infrastructure Management ──────────────────────────────
  {
    label: "Infrastructure Management",
    icon: Network,
    children: [
      {
        to: "/infrastructure",
        label: "Infrastructure Overview",
        icon: Network,
        permission: "view_infrastructure",
      },
      {
        to: "/infrastructure/network",
        label: "Network Configuration",
        icon: Network,
        permission: "network_configuration",
      },
      {
        to: "/infrastructure/servers",
        label: "Servers",
        icon: Server,
        permission: "server_installation",
      },
      {
        to: "/infrastructure/firewall",
        label: "Firewall Management",
        icon: Shield,
        permission: "firewall_configuration",
      },
      {
        to: "/tickets",
        label: "IT Operations",
        icon: ClipboardList,
        permission: "view_tickets",
      },
      {
        to: "/tickets",
        label: "Support Tickets",
        icon: MessageSquare,
        permission: "view_tickets",
      },
      {
        to: "/maintenance",
        label: "Maintenance",
        icon: Settings,
        permission: "approve_maintenance",
      },
      {
        to: "/backups",
        label: "Backups",
        icon: Database,
        permission: "backup_system",
      },
    ],
  },

  // ── Cloud Management ───────────────────────────────────────
  {
    label: "Cloud Management",
    icon: Cloud,
    children: [
      {
        to: "/cloud",
        label: "Cloud Resources",
        icon: Cloud,
        permission: "approve_cloud_resource",
      },
      {
        to: "/cloud/deployments",
        label: "Deployments",
        icon: GitBranch,
        permission: "deploy_application",
      },
      {
        to: "/cloud/scaling",
        label: "Auto Scaling",
        icon: Zap,
        permission: "scale_resource",
      },
    ],
  },

  // ── Quality & Compliance ───────────────────────────────────
  {
    label: "Quality & Compliance",
    icon: ClipboardCheck,
    children: [
      {
        to: "/quality",
        label: "Quality Reviews",
        icon: ClipboardCheck,
        permission: "view_quality_review",
      },
      {
        to: "/quality/tests",
        label: "Quality Tests",
        icon: TestTube,
        permission: "conduct_quality_test",
      },
      {
        to: "/quality/audits",
        label: "Document Audits",
        icon: FileText,
        permission: "audit_documents",
      },
      {
        to: "/quality/compliance",
        label: "Compliance",
        icon: ShieldCheck,
        permission: "verify_compliance",
      },
    ],
  },

  // ── Analytics & Reports ────────────────────────────────────
  {
    label: "Analytics & Reports",
    icon: BarChart3,
    children: [
      {
        to: "/dashboard/executive",
        label: "Dashboards",
        icon: LayoutDashboard,
        permission: "view_executive_dashboard",
      },
      {
        to: "/reports",
        label: "Reports",
        icon: BarChart3,
        permission: "view_reports",
      },
      {
        to: "/reports/export",
        label: "Data Export",
        icon: Download,
        permission: "export_reports",
      },
    ],
  },

  // User Management ────────────────────────────────────────
  {
    label: "User Management",
    icon: Users,
    sectionLabel: "Management",
    permissions: ["view_users", "create_users"],
    requireAll: false,
    children: [
      {
        to: "/users",
        label: "Users",
        icon: Users,
        permission: "view_users",
      },
      {
        to: "/rbac",
        label: "Roles & Permissions",
        icon: ShieldCheck,
        permission: "manage_roles",
      },
    ],
  }, 

  // ── Communications ─────────────────────────────────────────
   {
      to: "/notifications",
      label: "Notifications",
      icon: Bell,
      permission: "view_notifications",
    },

  // ── Administration ─────────────────────────────────────────
  {
    label: "Administration",
    icon: Settings,
    sectionLabel: "Administration",
    permission: "manage_roles",
    children: [
      {
        to: "/rbac",
        label: "RBAC Management",
        icon: ShieldCheck,
        permission: "manage_roles",
      },
      {
        to: "/permissions",
        label: "My Permissions",
        icon: Shield,
        permission: "manage_roles", // Only show to those with role management
      },
      {
        to: "/settings",
        label: "System Settings",
        icon: Settings,
        permission: "manage_settings",
      },
      {
        to: "/settings/archive",
        label: "Archive Records",
        icon: Database,
        permission: "archive_records",
      },
    ],
  },
];

// Memoized nav item
const NavItem = memo(
  ({
    item,
    active,
    collapsed,
    level = 0,
  }: {
    item: NavItem;
    active: boolean;
    collapsed: boolean;
    level?: number;
  }) => {
    const Icon = item.icon;
    const content = (
      <div
        className={cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
          level > 0 && "pl-8",
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
      </div>
    );

    if (!item.to) {
      return <div className="cursor-default">{content}</div>;
    }

    return <Link to={item.to}>{content}</Link>;
  }
);

NavItem.displayName = "NavItem";

// Collapsible Section Component
const CollapsibleSection = memo(
  ({
    item,
    collapsed,
    hasAccess,
    isNavItemActive,
    path,
  }: {
    item: NavItem;
    collapsed: boolean;
    hasAccess: (item: NavItem) => boolean;
    isNavItemActive: (item: NavItem, path: string) => boolean;
    path: string;
  }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const Icon = item.icon;
    const { user } = useAuth();
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    // Filter children based on permissions
    const visibleChildren = useMemo(
      () => {
        if (!item.children) return [];
        
        console.log('[CollapsibleSection]', item.label, 'has', item.children.length, 'children');
        
        // For institutional users, show all Institution Portal children
        if (user?.user_type === "INSTITUTIONAL" && item.sectionLabel === "Institution Portal") {
          return item.children.filter(child => {
            if (!child.permission && !child.permissions) return true;
            if (child.permission) return hasPermission(child.permission);
            if (child.permissions) {
              return child.requireAll
                ? hasAllPermissions(child.permissions)
                : hasAnyPermission(child.permissions);
            }
            return false;
          });
        }
        
        // For Research Director, check children permissions directly
        const isResearchDirector = user?.roles?.some(role => role.name === "research_director");
        if (isResearchDirector && item.sectionLabel === "Research Director") {
          const filtered = item.children.filter(child => {
            // Check permission
            if (child.permission) return hasPermission(child.permission);
            if (child.permissions) {
              return child.requireAll
                ? hasAllPermissions(child.permissions)
                : hasAnyPermission(child.permissions);
            }
            return true; // No permission required
          });
          console.log('[CollapsibleSection]', item.label, 'Research Director visible children:', filtered.length, filtered.map(c => c.label));
          return filtered;
        }
        
        // For other users, use the standard hasAccess filter
        const filtered = item.children.filter(hasAccess);
        console.log('[CollapsibleSection]', item.label, 'visible children:', filtered.length, filtered.map(c => c.label));
        return filtered;
      },
      [item.children, item.sectionLabel, item.label, hasAccess, user, hasPermission, hasAllPermissions]
    );

    if (visibleChildren.length === 0) return null;

    // Check if any child is active
    const hasActiveChild = visibleChildren.some((child) =>
      child.to ? isNavItemActive(child, path) : false
    );

    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "w-full group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
            hasActiveChild
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          <div className="flex items-center gap-3">
            <Icon
              className={cn(
                "h-[18px] w-[18px] shrink-0",
                hasActiveChild ? "" : "text-muted-foreground group-hover:text-sidebar-accent-foreground",
              )}
            />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </div>
          {!collapsed && (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )
          )}
        </button>
        {isExpanded && !collapsed && (
          <div className="ml-2 mt-1 space-y-0.5 border-l-2 border-sidebar-border/50 pl-2">
            {visibleChildren.map((child) => {
              const active = child.to ? isNavItemActive(child, path) : false;
              return (
                <NavItem
                  key={child.to || child.label}
                  item={child}
                  active={active}
                  collapsed={false}
                  level={1}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

CollapsibleSection.displayName = "CollapsibleSection";

export const Sidebar = memo(function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { hasPermission, hasAnyPermission, hasAllPermissions, isITDBAdmin, user } =
    usePermissions();
  const { logout, user: authUser } = useAuth();

  console.log('[Sidebar] Rendering with user:', user?.email, 'type:', user?.user_type);

  // Get the appropriate dashboard route for this user
  const dashboardRoute = useMemo(() => {
    if (!user) return "/dashboard";
    
    // For institutional users, go directly to their institution dashboard
    if (user.user_type === "INSTITUTIONAL" && user.permissions?.includes("view_institution_dashboard")) {
      return "/dashboard/institution?tab=my-requests";
    }
    
    // For internal staff with executive dashboard access
    if (user.permissions?.includes("view_executive_dashboard")) {
      const isBureauHead = user.roles?.some(role => role.name === "bureau_head");
      return isBureauHead ? "/dashboard/bureau-head" : "/dashboard/executive";
    }
    
    // Default to main dashboard resolver
    return "/dashboard";
  }, [user]);

  const hasAccess = useMemo(() => {
    return (item: NavItem): boolean => {
      // For institutional users, ONLY allow Institution Portal section
      if (user?.user_type === "INSTITUTIONAL") {
        // Allow the Institution Portal parent item
        if (item.sectionLabel === "Institution Portal") {
          return true;
        }
        // Hide everything else
        return false;
      }

      // For Research Director role, show items from Research Director section
      const isResearchDirector = user?.roles?.some(role => role.name === "research_director");
      if (isResearchDirector) {
        // Show items with Research Director section label
        if (item.sectionLabel === "Research Director") {
          // Check permission if specified
          if (item.permission) return hasPermission(item.permission);
          if (item.permissions) {
            return item.requireAll
              ? hasAllPermissions(item.permissions)
              : hasAnyPermission(item.permissions);
          }
          return true;
        }
        // Hide everything else for research directors
        return false;
      }

      // For admin only items
      if (item.adminOnly) return isITDBAdmin();
      
      // Hide "Dashboards" section for low-level workers
      if (item.sectionLabel === "Dashboards") {
        const hasLowLevelPermissions = (user?.permissions?.length || 0) < 10;
        if (hasLowLevelPermissions) {
          return false;
        }
      }
      
      // Hide Research Director section from other users
      if (item.sectionLabel === "Research Director") {
        return false;
      }
      
      // Standard permission check for internal staff
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
    () => {
      console.log('[Sidebar] Computing visible items for user:', user?.email, 'roles:', user?.roles);
      
      // For institutional users, ONLY show Institution Portal section
      if (user?.user_type === "INSTITUTIONAL") {
        const institutionPortalItem = nav.find(item => item.sectionLabel === "Institution Portal");
        return institutionPortalItem ? [institutionPortalItem] : [];
      }
      
      // For Research Director, ONLY show Research Director section items
      const isResearchDirector = user?.roles?.some(role => role.name === "research_director");
      console.log('[Sidebar] Is research director:', isResearchDirector);
      
      if (isResearchDirector) {
        const researchDirectorItems = nav.filter(item => item.sectionLabel === "Research Director");
        console.log('[Sidebar] Research Director items found:', researchDirectorItems.length);
        console.log('[Sidebar] Items:', researchDirectorItems.map(i => i.label));
        
        // Apply hasAccess filter
        const accessibleItems = researchDirectorItems.filter(hasAccess);
        console.log('[Sidebar] Accessible items after hasAccess filter:', accessibleItems.length);
        console.log('[Sidebar] Accessible:', accessibleItems.map(i => i.label));
        
        return accessibleItems;
      }
      
      // For low-level workers (less than 10 permissions), hide Dashboards section
      const hasLowLevelPermissions = (user?.permissions?.length || 0) < 10;
      if (hasLowLevelPermissions) {
        return nav.filter(item => item.sectionLabel !== "Dashboards" && item.sectionLabel !== "Research Director").filter(hasAccess);
      }
      
      // For all other users, show all accessible items (exclude Research Director section)
      return nav.filter(item => item.sectionLabel !== "Research Director").filter(hasAccess);
    },
    [hasAccess, user]
  );

  const isNavItemActive = (item: NavItem, currentPath: string): boolean => {
    if (!item.to) return false;
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
      <a href={dashboardRoute}>
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0 cursor-pointer hover:bg-sidebar-accent/50 transition-colors">
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
      </a>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-thin">
        {visibleNavItems.map((item, index) => {
          const prevItem = visibleNavItems[index - 1];
          const isInstitutionalUser = user?.user_type === "INSTITUTIONAL";
          const isResearchDirector = user?.roles?.some(role => role.name === "research_director");
          
          // Never show section labels for institutional users or research directors
          const showSectionLabel =
            !collapsed &&
            item.sectionLabel &&
            !isInstitutionalUser &&
            !isResearchDirector &&
            (index === 0 || prevItem?.sectionLabel !== item.sectionLabel);

          // If item has children, render as collapsible section
          if (item.children) {
            return (
              <div key={item.label}>
                {showSectionLabel && (
                  <div className="px-3 pt-3 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {item.sectionLabel}
                  </div>
                )}
                <CollapsibleSection
                  item={item}
                  collapsed={collapsed}
                  hasAccess={hasAccess}
                  isNavItemActive={isNavItemActive}
                  path={path}
                />
              </div>
            );
          }

          // Regular nav item without children
          const active = item.to ? isNavItemActive(item, path) : false;
          return (
            <div key={item.to || item.label}>
              {item.separator && !collapsed && index < visibleNavItems.length - 1 && (
                <div className="my-2 border-t border-sidebar-border/50" />
              )}
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
