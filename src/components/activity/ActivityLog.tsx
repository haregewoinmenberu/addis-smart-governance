import { useQuery } from "@tanstack/react-query";
import { getActivityLogs } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Activity, CheckCircle2, AlertCircle, Info, Clock } from "lucide-react";

interface ActivityLogProps {
  limit?: number;
  showTitle?: boolean;
}

export function ActivityLog({ limit = 10, showTitle = true }: ActivityLogProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["activity-logs", limit],
    queryFn: () => getActivityLogs(limit),
  });

  const activities = data?.data || [];

  const getActivityIcon = (action: string) => {
    if (action.includes("create") || action.includes("add")) {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    }
    if (action.includes("delete") || action.includes("remove")) {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
    if (action.includes("update") || action.includes("edit")) {
      return <Info className="h-4 w-4 text-blue-600" />;
    }
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getActivityBadgeVariant = (action: string): "default" | "secondary" | "destructive" => {
    if (action.includes("create") || action.includes("approve")) return "default";
    if (action.includes("delete") || action.includes("reject")) return "destructive";
    return "secondary";
  };

  if (isLoading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your recent actions in the system</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your recent actions in the system</CardDescription>
        </CardHeader>
      )}
      <CardContent className={showTitle ? "" : "pt-6"}>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activity logs found
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {activities.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="mt-0.5">{getActivityIcon(log.action)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={getActivityBadgeVariant(log.action)} className="text-xs">
                            {log.action}
                          </Badge>
                          <span className="text-sm font-medium">{log.module}</span>
                        </div>
                        {log.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {log.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
                      </span>
                      {log.ip_address && (
                        <span>IP: {log.ip_address}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
