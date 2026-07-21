import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface AccessDeniedProps {
  message?: string;
  requiredPermission?: string;
  requiredRole?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
}

export function AccessDenied({
  message = "You don't have permission to access this resource",
  requiredPermission,
  requiredRole,
  showBackButton = true,
  showHomeButton = true,
}: AccessDeniedProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <ShieldAlert className="h-10 w-10 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">Access Denied</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTitle>Unauthorized Access</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>

          {requiredPermission && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Required Permission:</span>{" "}
              <code className="bg-muted px-2 py-1 rounded">{requiredPermission}</code>
            </div>
          )}

          {requiredRole && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Required Role:</span>{" "}
              <code className="bg-muted px-2 py-1 rounded">{requiredRole}</code>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            If you believe this is an error, please contact your system administrator
            to request the appropriate permissions.
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-2">
          {showBackButton && (
            <Button variant="outline" onClick={() => navigate({ to: ".." })}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          )}
          {showHomeButton && (
            <Button onClick={() => navigate({ to: "/dashboard" })}>
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
