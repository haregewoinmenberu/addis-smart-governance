import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import type { PermissionName } from "@/types/rbac";

interface PermissionBadgeProps {
  permission: PermissionName;
  showIcon?: boolean;
  className?: string;
}

/**
 * Permission Badge Component
 * Displays a styled badge for permissions
 */
export function PermissionBadge({ permission, showIcon = true, className }: PermissionBadgeProps) {
  // Format permission name for display
  const displayName = permission
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <Badge variant="secondary" className={`text-xs ${className || ''}`}>
      {showIcon && <Check className="w-3 h-3 mr-1" />}
      {displayName}
    </Badge>
  );
}
