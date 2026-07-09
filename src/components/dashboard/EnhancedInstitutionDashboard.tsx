import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bell,
  BarChart3,
  Users,
  Settings,
  MessageSquare,
  Upload,
  Download,
  Activity,
  TrendingUp,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  Calendar,
  Filter,
  Search,
  Image,
  File,
  Sheet,
  Shield,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Globe,
  Hash,
  Sparkles,
  Bot,
  Send,
  Paperclip,
  LineChart,
  PieChart,
  BarChart2,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  AlertTriangle,
  CheckCircle,
  XOctagon,
  Zap,
  Target,
  Award,
  Briefcase,
  Flag,
  LogOut,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface Institution {
  id: number;
  name: string;
  type: string;
  status: string;
  email: string;
  phone: string;
  verified_at: string | null;
}

interface ServiceRequest {
  id: number;
  reference_number: string;
  service_type: string;
  status: string;
  created_at: string;
  form_data: unknown;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

// Import feature components
import { TeamManagement } from "./features/TeamManagement";

export function EnhancedInstitutionDashboard() {
  const [activeTab, setActiveTab] = useState("requests");
  const { logout } = useAuth();

  // Fetch institution data
  const { data: institutionData, isLoading: institutionLoading } = useQuery({
    queryKey: ["my-institution"],
    queryFn: () => apiGet<{ success: boolean; data: Institution }>("/institutions/my-institution"),
  });

  // Fetch service requests
  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ["institution-requests", institutionData?.data?.id],
    queryFn: () =>
      institutionData?.data?.id
        ? apiGet<{ success: boolean; data: { data: ServiceRequest[] } }>(
            `/institutions/${institutionData.data.id}/requests`,
          )
        : null,
    enabled: !!institutionData?.data?.id,
  });

  // Mock notifications for now
  const notifications: Notification[] = [
    {
      id: 1,
      title: "Application Approved",
      message: "Your research proposal has been approved",
      type: "success",
      read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Document Required",
      message: "Please upload additional documentation for your transformation request",
      type: "warning",
      read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      title: "New Team Member",
      message: "John Doe has joined your team as a Manager",
      type: "info",
      read: false,
      created_at: new Date().toISOString(),
    },
  ];

  const institution = institutionData?.data;
  const requests = requestsData?.data?.data || [];

  const getRequestStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending", icon: Clock },
      approved: { variant: "default" as const, label: "Approved", icon: CheckCircle2 },
      rejected: { variant: "destructive" as const, label: "Rejected", icon: XCircle },
      in_progress: { variant: "outline" as const, label: "In Progress", icon: Activity },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      success: <CheckCircle className="h-5 w-5 text-green-600" />,
      warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
      error: <XOctagon className="h-5 w-5 text-red-600" />,
      info: <Info className="h-5 w-5 text-blue-600" />,
    };
    return icons[type as keyof typeof icons] || icons.info;
  };

  if (institutionLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!institution) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold mb-2">No Institution Found</p>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Your account is not associated with any institution. Please contact support for
            assistance.
          </p>
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "pending").length;
  const approvedRequests = requests.filter((r) => r.status === "approved").length;
  const rejectedRequests = requests.filter((r) => r.status === "rejected").length;
  const totalRequests = requests.length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-primary/20 to-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">{institution.name}</h1>
                <p className="text-xs text-muted-foreground">
                  {institution.type.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Bell */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setActiveTab("notifications")}
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {unreadNotifications}
                </span>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10 text-primary text-sm font-semibold">
                      {institution.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{institution.name}</p>
                    <p className="text-xs text-muted-foreground">{institution.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab("team")}>
                  <Users className="mr-2 h-4 w-4" />
                  Team
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Support
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive cursor-pointer" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 px-4">
        {/* Verification Warning Banner */}
        {!institution.verified_at && (
          <Alert
            variant="default"
            className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950"
          >
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <AlertTitle className="text-yellow-900 dark:text-yellow-100">
              Account Pending Verification
            </AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              Your institution is pending STRP verification. Some features may be limited until your
              account is approved.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setActiveTab("requests")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalRequests}</div>
              <p className="text-xs text-muted-foreground mt-1">All service requests</p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setActiveTab("requests")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{pendingRequests}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setActiveTab("requests")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{approvedRequests}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully processed</p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setActiveTab("notifications")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{unreadNotifications}</div>
              <p className="text-xs text-muted-foreground mt-1">Unread messages</p>
              {unreadNotifications > 0 && (
                <Badge variant="destructive" className="mt-2 animate-pulse">
                  {unreadNotifications} New
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Requests</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
              {unreadNotifications > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 min-w-5 rounded-full px-1 text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
          </TabsList>

          {/* Requests Tab */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Service Requests</CardTitle>
                    <CardDescription>Track and manage all your service requests</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Request
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <FileText className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No requests yet</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                      Get started by submitting your first service request. Our team will review and
                      process it promptly.
                    </p>
                    <Button size="lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Submit First Request
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.map((request) => (
                      <Card key={request.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-primary/20 to-primary/10">
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold">
                                      {request.service_type.replace(/_/g, " ").toUpperCase()}
                                    </h4>
                                    {getRequestStatusBadge(request.status)}
                                  </div>
                                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                    {request.reference_number}
                                  </p>
                                </div>
                              </div>
                              <div className="ml-13 space-y-1">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Submitted {new Date(request.created_at).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {Math.floor(
                                      (Date.now() - new Date(request.created_at).getTime()) /
                                        (1000 * 60 * 60 * 24),
                                    )}{" "}
                                    days ago
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Notifications & Alerts</CardTitle>
                    <CardDescription>
                      {unreadNotifications > 0
                        ? `You have ${unreadNotifications} unread notification${
                            unreadNotifications > 1 ? "s" : ""
                          }`
                        : "You're all caught up!"}
                    </CardDescription>
                  </div>
                  {unreadNotifications > 0 && (
                    <Button variant="outline" size="sm">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark All as Read
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <Card
                      key={notif.id}
                      className={`transition-all ${
                        !notif.read ? "border-primary/50 bg-primary/5" : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 mt-1">{getNotificationIcon(notif.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-sm">{notif.title}</h4>
                                  {!notif.read && (
                                    <Badge variant="default" className="animate-pulse">
                                      New
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{notif.message}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(notif.created_at).toLocaleString()}
                                  </span>
                                  <Badge variant="secondary" className="text-xs">
                                    {notif.type}
                                  </Badge>
                                </div>
                              </div>
                              {!notif.read && (
                                <Button variant="ghost" size="sm">
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Real-time notification indicator */}
                <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-dashed">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                      <Zap className="h-5 w-5 text-primary animate-pulse" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Real-time Notifications</p>
                      <p className="text-xs text-muted-foreground">
                        You'll receive instant alerts for request updates, approvals, and system
                        messages
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Team Tab */}
          {/* Team Tab */}
          <TabsContent value="team">
            <TeamManagement institutionId={institution.id} institutionName={institution.name} />
          </TabsContent>
        </Tabs>

        {/* Floating AI Widget */}
      </main>
    </div>
  );
}
