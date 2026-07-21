import { useRBAC } from "@/hooks/useRBAC";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, AlertCircle } from "lucide-react";
import type { PermissionName, RoleName } from "@/types/rbac";

interface PermissionCheckerProps {
  permissions?: PermissionName[];
  roles?: RoleName[];
}

/**
 * Developer tool to check current user's permissions
 */
export function PermissionChecker({ permissions = [], roles = [] }: PermissionCheckerProps) {
  const { user, getPermissions, getRoles, hasPermission, hasRole } = useRBAC();

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not Authenticated</AlertTitle>
        <AlertDescription>User must be logged in to check permissions</AlertDescription>
      </Alert>
    );
  }

  const userPermissions = getPermissions();
  const userRoles = getRoles();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Current User Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">User: {user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Roles ({userRoles.length})</h4>
            <div className="flex flex-wrap gap-2">
              {userRoles.map((role) => (
                <Badge key={role.id} variant="secondary">
                  {role.display_name}
                </Badge>
              ))}
              {userRoles.length === 0 && (
                <span className="text-sm text-muted-foreground">No roles assigned</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Permissions ({userPermissions.length})</h4>
            <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
              {userPermissions.map((permission) => (
                <Badge key={permission} variant="outline" className="text-xs">
                  {permission}
                </Badge>
              ))}
              {userPermissions.length === 0 && (
                <span className="text-sm text-muted-foreground">No permissions</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {permissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Permission Check Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {permissions.map((permission) => {
                const has = hasPermission(permission);
                return (
                  <div key={permission} className="flex items-center gap-2">
                    {has ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span className={has ? "text-green-700" : "text-red-700"}>
                      {permission}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {roles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Role Check Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {roles.map((role) => {
                const has = hasRole(role);
                return (
                  <div key={role} className="flex items-center gap-2">
                    {has ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span className={has ? "text-green-700" : "text-red-700"}>
                      {role}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
