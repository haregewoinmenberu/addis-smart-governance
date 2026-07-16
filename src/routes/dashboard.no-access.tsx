import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Home, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/no-access")({
  component: NoAccessDashboard,
});

/**
 * Dashboard for users who don't have any dashboard permissions
 * This prevents redirect loops and provides clear feedback
 * 
 * NOTE: This page is intentionally simple and has no permission checks
 * to serve as the final fallback for users without dashboard access
 */
function NoAccessDashboard() {
  const { user, logout } = useAuth();

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-6 w-6" />
              No Dashboard Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Welcome, <strong>{user?.name || "User"}</strong>!
            </p>
            <p className="text-gray-700">
              Your account is currently active, but you don't have permission to access any dashboard modules yet.
            </p>
            <div className="bg-white border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">What's next?</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Contact your administrator to request dashboard access</li>
                <li>Ensure your account has been assigned the appropriate role</li>
                <li>Check if your account registration is complete</li>
              </ul>
            </div>
            {user && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Account Information</h3>
                <div className="text-sm space-y-1">
                  <p><span className="text-gray-600">Email:</span> <span className="font-medium">{user.email}</span></p>
                  <p><span className="text-gray-600">User Type:</span> <span className="font-medium">{user.user_type || "N/A"}</span></p>
                  <p><span className="text-gray-600">Role:</span> <span className="font-medium">
                    {user.roles && user.roles.length > 0 ? user.roles[0].display_name : "No role assigned"}
                  </span></p>
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" asChild className="flex-1">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Home
                </Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => logout()}
                className="flex-1"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
