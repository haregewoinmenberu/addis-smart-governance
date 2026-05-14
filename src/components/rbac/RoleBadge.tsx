import { Badge } from "@/components/ui/badge";
import { getRoleBadgeColor, formatRoleName } from "@/lib/rbac";
import type { RoleName } from "@/types/rbac";
import { Shield, UserCheck, ClipboardCheck } from "lucide-react";

interface RoleBadgeProps {
  role: RoleName;
  showIcon?: boolean;
  className?: string;
}

const roleIcons: Record<RoleName, React.ComponentType<{ className?: string }>> = {
  itdb_administrator: Shield,
  sub_city_administrator: UserCheck,
  auditor: ClipboardCheck,
};

/**
 * Role Badge Component
 * Displays a styled badge for user roles
 */
export function RoleBadge({ role, showIcon = true, className }: RoleBadgeProps) {
  const Icon = roleIcons[role];
  const colorClass = getRoleBadgeColor(role);

  return (
    <Badge variant="outline" className={`${colorClass} ${className || ''}`}>
      {showIcon && Icon && <Icon className="w-3 h-3 mr-1" />}
      {formatRoleName(role)}
    </Badge>
  );
}
