import { useQuery } from "@tanstack/react-query";
import { permissionsApi } from "@/lib/api/rbac";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield } from "lucide-react";
import type { Permission } from "@/types/rbac";

interface PermissionsListProps {
  roleId?: number;
  grouped?: boolean;
  compact?: boolean;
}

export function PermissionsList({ roleId, grouped = true, compact = false }: PermissionsListProps) {
  const { data: permissionsData, isLoading } = useQuery({
    queryKey: roleId ? ["permissions", "role", roleId] : ["permissions", "all"],
    queryFn: () =>
      roleId
        ? permissionsApi.roles(roleId)
        : permissionsApi.list({ group_by_module: grouped, paginate: false }),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (!permissionsData) {
    return <div className="text-sm text-muted-foreground">No permissions found</div>;
  }

  // Handle grouped permissions
  if (grouped && typeof permissionsData === "object" && !Array.isArray(permissionsData)) {
    return (
      <div className="space-y-4">
        {Object.entries(permissionsData as Record<string, Permission[]>).map(
          ([module, permissions]) => (
            <Card key={module}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium capitalize flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {module}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {permissions.map((permission) => (
                    <Badge key={permission.id} variant="outline" className="text-xs">
                      {permission.display_name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    );
  }

  // Handle flat list
  const permissions = Array.isArray(permissionsData) ? permissionsData : [];

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {permissions.map((permission) => (
          <Badge key={permission.id} variant="secondary" className="text-xs">
            {permission.display_name}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {permissions.map((permission) => (
        <div key={permission.id} className="flex items-center justify-between p-2 border rounded">
          <div>
            <div className="font-medium text-sm">{permission.display_name}</div>
            <div className="text-xs text-muted-foreground">{permission.name}</div>
          </div>
          <Badge variant="outline">{permission.module}</Badge>
        </div>
      ))}
    </div>
  );
}
