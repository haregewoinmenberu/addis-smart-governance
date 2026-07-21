import { useAuth } from "@/hooks/useAuth";
import { Can } from "@/components/rbac/Can";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getRoleDisplayName, formatPermissionName } from "@/lib/rbac";
import { Shield, User, Mail, Phone, Building, Calendar } from "lucide-react";

export function UserProfile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">View your account information and permissions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <p className="text-lg font-semibold">{user.name}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <p>{user.email}</p>
            </div>
            {user.phone && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </label>
                  <p>{user.phone}</p>
                </div>
              </>
            )}
            {user.department && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Department
                  </label>
                  <p>{user.department}</p>
                </div>
              </>
            )}
            {user.last_login_at && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Last Login
                  </label>
                  <p>{new Date(user.last_login_at).toLocaleString()}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Assigned Roles
            </CardTitle>
            <CardDescription>Your access roles in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {user.roles && user.roles.length > 0 ? (
              <div className="space-y-2">
                {user.roles.map((role) => (
                  <div key={role.name} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                    <div>
                      <p className="font-semibold">{getRoleDisplayName(role)}</p>
                      <p className="text-sm text-muted-foreground">{role.name}</p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No roles assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>My Permissions</CardTitle>
          <CardDescription>
            You have {user.permissions?.length || 0} permissions granted through your roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user.permissions && user.permissions.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {user.permissions.map((permission) => (
                <div
                  key={permission}
                  className="flex items-center gap-2 p-2 rounded-md border bg-card text-sm"
                >
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>{formatPermissionName(permission)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No permissions granted</p>
          )}
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
          <CardDescription>Current status of your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Account Type</span>
            <Badge variant="outline">{user.user_type}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Account Status</span>
            <Badge variant={user.is_active ? "default" : "destructive"}>
              {user.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Multi-Factor Authentication</span>
            <Badge variant={user.mfa_enabled ? "default" : "secondary"}>
              {user.mfa_enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
