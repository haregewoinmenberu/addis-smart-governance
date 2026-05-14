import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  getNotificationStatistics,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
  deleteAllNotifications,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  MoreVertical, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Webhook,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Filter
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/notifications/")({
  head: () => ({ meta: [{ title: "Notifications — STRP" }] }),
  component: Page,
});

function Page() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    action: "delete" | "delete-all" | "delete-read" | null;
    target: any | null;
  }>({ isOpen: false, action: null, target: null });

  // Build query params
  const queryParams: Record<string, string> = {
    unread_only: activeTab === "unread" ? "true" : "false",
  };
  if (filterType) queryParams.type = filterType;
  if (filterPriority) queryParams.priority = filterPriority;

  // Fetch notifications with real-time updates
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["notifications", activeTab, filterType, filterPriority],
    queryFn: () => getNotifications(queryParams),
    refetchInterval: 10000, // Real-time: Refetch every 10 seconds
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ["notifications", "statistics"],
    queryFn: getNotificationStatistics,
    refetchInterval: 30000, // Update stats every 30 seconds
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    },
  });

  // Mark as unread mutation
  const markUnreadMutation = useMutation({
    mutationFn: markNotificationAsUnread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "Success",
        description: "Notification marked as unread",
      });
    },
  });

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "Success",
        description: `${data.count} notification(s) marked as read`,
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "Success",
        description: "Notification deleted",
      });
    },
  });

  // Delete all read mutation
  const deleteAllReadMutation = useMutation({
    mutationFn: deleteAllReadNotifications,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "Success",
        description: `${data.count} notification(s) deleted`,
      });
    },
  });

  // Delete all mutation
  const deleteAllMutation = useMutation({
    mutationFn: deleteAllNotifications,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "Success",
        description: `${data.count} notification(s) deleted`,
      });
    },
  });

  const openConfirm = (action: "delete" | "delete-all" | "delete-read", target: any = null) => {
    setConfirmState({ isOpen: true, action, target });
  };

  const closeConfirm = () => {
    setConfirmState({ isOpen: false, action: null, target: null });
  };

  const handleConfirm = () => {
    if (!confirmState.action) return;
    
    if (confirmState.action === "delete" && confirmState.target) {
      deleteMutation.mutate(confirmState.target.id);
    } else if (confirmState.action === "delete-all") {
      deleteAllMutation.mutate();
    } else if (confirmState.action === "delete-read") {
      deleteAllReadMutation.mutate();
    }
    
    closeConfirm();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'error': return <XCircle className="h-5 w-5 text-destructive" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-warning-foreground" />;
      case 'security': return '🔒';
      case 'audit': return '📋';
      case 'request': return '📝';
      case 'workflow': return '⚡';
      case 'system': return '⚙️';
      case 'deadline': return <Clock className="h-5 w-5 text-warning-foreground" />;
      default: return 'ℹ';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high': return 'bg-warning/10 text-warning-foreground border-warning/20';
      case 'normal': return 'bg-info/10 text-info border-info/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-3 w-3" />;
      case 'sms': return <MessageSquare className="h-3 w-3" />;
      case 'push': return <Smartphone className="h-3 w-3" />;
      case 'webhook': return <Webhook className="h-3 w-3" />;
      default: return <Bell className="h-3 w-3" />;
    }
  };

  const getDeliveryStatus = (notification: any) => {
    // Mock delivery status - in real implementation, this would come from backend
    const channels = ['in_app', 'email', 'sms'];
    const statuses = channels.map(channel => ({
      channel,
      status: notification.sent_at ? 'delivered' : 'pending',
      timestamp: notification.sent_at || notification.created_at,
    }));
    return statuses;
  };

  const notifications = notificationsData?.data || [];

  return (
    <AppShell>
      <PageHeader
        title="Notifications"
        subtitle="Real-time alerts, deadline reminders and multi-channel delivery status."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending || stats?.unread === 0}
              className="gap-1.5"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openConfirm("delete-read")}>
                  Delete read notifications
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openConfirm("delete-all")}
                  className="text-destructive"
                >
                  Delete all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="p-4 rounded-xl border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold mt-1">{stats?.total || 0}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Bell className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 rounded-xl border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Unread</p>
              <p className="text-2xl font-bold mt-1">{stats?.unread || 0}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-warning/10 text-warning-foreground flex items-center justify-center">
              <Eye className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 rounded-xl border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Today</p>
              <p className="text-2xl font-bold mt-1">{stats?.today || 0}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 rounded-xl border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold mt-1">{stats?.this_week || 0}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-info/10 text-info flex items-center justify-center">
              <Bell className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 rounded-xl border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Urgent</p>
              <p className="text-2xl font-bold mt-1">{stats?.by_priority?.urgent || 0}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Filter className="h-4 w-4" />
              Type {filterType && `(${filterType})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilterType(null)}>
              All Types
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType('request')}>
              Requests
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType('audit')}>
              Audits
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType('security')}>
              Security
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType('workflow')}>
              Workflows
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType('deadline')}>
              Deadlines
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType('system')}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Filter className="h-4 w-4" />
              Priority {filterPriority && `(${filterPriority})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilterPriority(null)}>
              All Priorities
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPriority('urgent')}>
              Urgent
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPriority('high')}>
              High
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPriority('normal')}>
              Normal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPriority('low')}>
              Low
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {(filterType || filterPriority) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterType(null);
              setFilterPriority(null);
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/40 p-1 rounded-xl mb-6">
          <TabsTrigger value="all" className="gap-1.5">
            All
            {stats?.total ? <Badge variant="secondary" className="ml-1 text-[10px]">{stats.total}</Badge> : null}
          </TabsTrigger>
          <TabsTrigger value="unread" className="gap-1.5">
            Unread
            {stats?.unread ? <Badge variant="secondary" className="ml-1 text-[10px]">{stats.unread}</Badge> : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card className="rounded-2xl border-border/60 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No notifications</p>
                {(filterType || filterPriority) && (
                  <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {notifications.map((notification: any) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/30 transition-colors ${
                      !notification.read_at ? "bg-primary/5 border-l-4 border-l-primary" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            {!notification.read_at && (
                              <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 animate-pulse" />
                            )}
                            <Badge variant="secondary" className={`text-[10px] ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {notification.type}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {notification.read_at ? (
                                <DropdownMenuItem onClick={() => markUnreadMutation.mutate(notification.id)}>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Mark as unread
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => markReadMutation.mutate(notification.id)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Mark as read
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => openConfirm("delete", notification)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        
                        {/* Multi-channel Delivery Status */}
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs text-muted-foreground">Delivery:</span>
                          {getDeliveryStatus(notification).map((status) => (
                            <div key={status.channel} className="flex items-center gap-1">
                              {getChannelIcon(status.channel)}
                              <span className={`text-xs ${status.status === 'delivered' ? 'text-success' : 'text-muted-foreground'}`}>
                                {status.status === 'delivered' ? '✓' : '○'}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
                          <span>•</span>
                          <span>{format(new Date(notification.created_at), "MMM d, yyyy HH:mm")}</span>
                          {notification.created_by && (
                            <>
                              <span>•</span>
                              <span>From: {notification.created_by.name}</span>
                            </>
                          )}
                        </div>
                        {notification.action_url && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 mt-2 text-primary"
                            onClick={() => window.location.href = notification.action_url}
                          >
                            {notification.action_text || "View Details"} →
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmState.isOpen} onOpenChange={closeConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmState.action === "delete" && "Delete notification?"}
              {confirmState.action === "delete-all" && "Delete all notifications?"}
              {confirmState.action === "delete-read" && "Delete read notifications?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmState.action === "delete" && "This notification will be permanently deleted."}
              {confirmState.action === "delete-all" && "All notifications will be permanently deleted. This action cannot be undone."}
              {confirmState.action === "delete-read" && "All read notifications will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
