import { useQuery } from "@tanstack/react-query";
import { rolesApi } from "@/lib/api/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, ChevronRight } from "lucide-react";
import { sortRolesByHierarchy } from "@/utils/rbacHelpers";

export function RoleHierarchyView() {
  const { data: rolesData, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => rolesApi.list(),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const roles = rolesData?.data || [];
  const sortedRoles = sortRolesByHierarchy(roles);

  const hierarchyLevels = [
    { name: "Bureau Level", roles: sortedRoles.filter((r) => r.name === "bureau_head") },
    {
      name: "Sector Heads",
      roles: sortedRoles.filter((r) =>
        ["smart_city_sector_head", "development_sector_head", "operation_sector_head"].includes(
          r.name
        )
      ),
    },
    {
      name: "Directors",
      roles: sortedRoles.filter((r) => r.name.includes("_director")),
    },
    {
      name: "Team Leaders",
      roles: sortedRoles.filter((r) => r.name.includes("_team_leader")),
    },
    {
      name: "Officers & Staff",
      roles: sortedRoles.filter(
        (r) =>
          r.name.includes("_officer") ||
          r.name.includes("_developer") ||
          r.name.includes("_engineer") ||
          r.name.includes("_manager")
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Role Hierarchy</h3>
      </div>

      {hierarchyLevels.map((level, index) => (
        <Card key={level.name}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Badge variant="outline">{index + 1}</Badge>
              {level.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {level.roles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No roles in this level</p>
              ) : (
                level.roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-2 border rounded hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{role.display_name}</div>
                        <div className="text-xs text-muted-foreground">{role.name}</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {role.permissions?.length || 0} permissions
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
