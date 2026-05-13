import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FileStack, ClipboardCheck, Database, ShieldCheck,
  Lock, Building2, GitBranch, BarChart3, MessageSquare, Bell,
  Users, Settings, ChevronLeft, Sparkles, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/requests", label: "Technology Requests", icon: FileStack },
  { to: "/duplication", label: "Duplication Analysis", icon: Layers },
  { to: "/feasibility", label: "Feasibility Studies", icon: ClipboardCheck },
  { to: "/registry", label: "Technology Registry", icon: Database },
  { to: "/audit", label: "Audit & Compliance", icon: ShieldCheck },
  { to: "/cybersecurity", label: "Cybersecurity", icon: Lock },
  { to: "/vendors", label: "Vendor Management", icon: Building2 },
  { to: "/workflows", label: "Approval Workflows", icon: GitBranch },
  { to: "/reports", label: "Reports & Analytics", icon: BarChart3 },
  { to: "/surveys", label: "Surveys & Feedback", icon: MessageSquare },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/users", label: "User Management", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

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
        {nav.map((item) => {
          const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
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
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
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
}
