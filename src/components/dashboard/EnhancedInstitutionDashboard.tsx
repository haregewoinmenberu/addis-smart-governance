import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import {
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bell,
  Activity,
  Plus,
  Eye,
  Calendar,
  Filter,
  Download,
  Info,
  AlertTriangle,
  CheckCircle,
  XOctagon,
  FlaskConical,
  Cpu,
  ShieldCheck,
  Zap,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { apiGet, apiDelete, apiPost } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { ServiceRequestForm } from "./ServiceRequestForm";
import { DataTable, Column } from "./DataTable";

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

export function EnhancedInstitutionDashboard() {
  const queryClient = useQueryClient();
  const search = useSearch({ from: '/dashboard/institution' }) as { tab?: string };
  const tabFromUrl = search?.tab;
  const [activeTab, setActiveTab] = useState(tabFromUrl || "request-service");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<any>(null);
  const [viewingSubmission, setViewingSubmission] = useState<any>(null);
  const [deletingSubmission, setDeletingSubmission] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("all");
  const [showTrackDialog, setShowTrackDialog] = useState(false);
  const [trackingReference, setTrackingReference] = useState("");

  // Update active tab when URL changes
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Fetch institution data
  const { data: institutionData, isLoading: institutionLoading } = useQuery({
    queryKey: ["my-institution"],
    queryFn: () => apiGet<{ success: boolean; data: Institution }>("/institutions/my-institution"),
  });

  // Fetch service requests (user submissions)
  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ["user-submissions", statusFilter, serviceTypeFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (serviceTypeFilter !== "all") params.append("service_type", serviceTypeFilter);
      const queryString = params.toString();
      return apiGet<{ success: boolean; data: ServiceRequest[] }>(
        `/service-forms/my-submissions${queryString ? `?${queryString}` : ""}`
      );
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/service-forms/${id}`),
    onSuccess: () => {
      toast({
        title: "Request Deleted",
        description: "Your service request has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["user-submissions"] });
      setDeletingSubmission(null);
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.response?.data?.message || "Failed to delete request",
        variant: "destructive",
      });
    },
  });

  // Track by reference mutation
  const trackMutation = useMutation({
    mutationFn: (referenceNumber: string) =>
      apiPost("/service-forms/track", { reference_number: referenceNumber }),
    onSuccess: () => {
      toast({
        title: "Request Added",
        description: "The submission has been added to your tracking list",
      });
      queryClient.invalidateQueries({ queryKey: ["user-submissions"] });
      setShowTrackDialog(false);
      setTrackingReference("");
    },
    onError: (error: any) => {
      toast({
        title: "Tracking Failed",
        description: error.response?.data?.message || "Could not add this request",
        variant: "destructive",
      });
    },
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
  const requests = requestsData?.data || [];

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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{institution.name}</h1>
            <p className="text-muted-foreground">
              {institution.type.replace(/_/g, " ")} • Institution Dashboard
            </p>
          </div>
        </div>
      </div>
      {/* Verification Warning Banner */}
      {!institution.verified_at && (
        <Alert
          variant="default"
          className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950"
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
          onClick={() => setActiveTab("my-requests")}
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
          onClick={() => setActiveTab("my-requests")}
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
          onClick={() => setActiveTab("my-requests")}
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="request-service" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Request Service</span>
            </TabsTrigger>
            <TabsTrigger value="my-requests" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">My Requests</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
              {unreadNotifications > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 min-w-5 rounded-full px-1 text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Request Service Tab */}
          <TabsContent value="request-service">
            {showRequestForm || editingSubmission ? (
              <ServiceRequestForm
                serviceType={selectedService as any}
                editingSubmission={editingSubmission}
                onSuccess={() => {
                  setShowRequestForm(false);
                  setEditingSubmission(null);
                  setSelectedService(null);
                  setActiveTab("my-requests");
                }}
                onCancel={() => {
                  setShowRequestForm(false);
                  setEditingSubmission(null);
                  setSelectedService(null);
                }}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Request a Service</CardTitle>
                  <CardDescription>Select a service type to submit a new request</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <Card 
                      className="border-2 cursor-pointer transition-all hover:border-primary hover:shadow-md"
                      onClick={() => {
                        setSelectedService('research');
                        setShowRequestForm(true);
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className="p-3 rounded-full bg-primary/10">
                            <FlaskConical className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="font-semibold">Research Services</h3>
                          <p className="text-xs text-muted-foreground">
                            Submit research proposals for evaluation and approval
                          </p>
                          <Button size="sm" className="w-full">
                            Start Application
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card 
                      className="border-2 cursor-pointer transition-all hover:border-primary hover:shadow-md"
                      onClick={() => {
                        setSelectedService('transformation');
                        setShowRequestForm(true);
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className="p-3 rounded-full bg-primary/10">
                            <Cpu className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="font-semibold">Technology Transformation</h3>
                          <p className="text-xs text-muted-foreground">
                            Request digital transformation and modernization services
                          </p>
                          <Button size="sm" className="w-full">
                            Start Application
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card 
                      className="border-2 cursor-pointer transition-all hover:border-primary hover:shadow-md"
                      onClick={() => {
                        setSelectedService('licensing');
                        setShowRequestForm(true);
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className="p-3 rounded-full bg-primary/10">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="font-semibold">Professional Licensing</h3>
                          <p className="text-xs text-muted-foreground">
                            Apply for IT professional licenses and certifications
                          </p>
                          <Button size="sm" className="w-full">
                            Start Application
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Alert className="mt-6">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Service Application Process</AlertTitle>
                    <AlertDescription>
                      Click on any service card to open the application form. After submitting,
                      you'll receive a reference number to track your request status in the "My Requests" tab.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Requests Tab */}
          <TabsContent value="my-requests">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Service Requests</CardTitle>
                    <CardDescription>Track and manage all your service requests</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Service type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Services</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="transformation">Transformation</SelectItem>
                        <SelectItem value="licensing">Licensing</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline"
                      onClick={() => setShowTrackDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Track Request
                    </Button>
                    <Button onClick={() => {
                      setActiveTab('request-service');
                      setShowRequestForm(false);
                      setSelectedService(null);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Request
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12" />
                    <Skeleton className="h-12" />
                    <Skeleton className="h-12" />
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <FileText className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No requests yet</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                      Get started by submitting your first service request. Our team will review and
                      process it promptly.
                    </p>
                    <Button size="lg" onClick={() => {
                      setActiveTab('request-service');
                      setShowRequestForm(false);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Submit First Request
                    </Button>
                  </div>
                ) : (
                  <DataTable
                    data={requests}
                    columns={[
                      {
                        header: "Reference",
                        cell: (request) => (
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <p className="font-mono text-sm font-medium">
                              {request.reference_number}
                            </p>
                          </div>
                        ),
                      },
                      {
                        header: "Service Type",
                        cell: (request) => (
                          <span className="text-sm capitalize">
                            {request.service_type.replace(/_/g, " ")}
                          </span>
                        ),
                      },
                      {
                        header: "Status",
                        cell: (request) => getRequestStatusBadge(request.status),
                      },
                      {
                        header: "Submitted",
                        cell: (request) => (
                          <span className="text-sm text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        ),
                      },
                      {
                        header: "Days Ago",
                        cell: (request) => (
                          <span className="text-sm text-muted-foreground">
                            {Math.floor(
                              (Date.now() - new Date(request.created_at).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}{" "}
                            days
                          </span>
                        ),
                      },
                      {
                        header: "Actions",
                        className: "text-right",
                        cell: (request) => (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewingSubmission(request)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {request.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingSubmission(request);
                                    setActiveTab("request-service");
                                    setShowRequestForm(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeletingSubmission(request)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        ),
                      },
                    ] as Column<ServiceRequest>[]}
                    pagination={{
                      currentPage: 1,
                      totalPages: Math.ceil(requests.length / 20),
                      pageSize: 20,
                      totalItems: requests.length,
                    }}
                  />
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
        </Tabs>

        {/* View Submission Dialog */}
        <Dialog open={!!viewingSubmission} onOpenChange={() => setViewingSubmission(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Service Request Details
              </DialogTitle>
              <DialogDescription>
                Reference: {viewingSubmission?.reference_number}
              </DialogDescription>
            </DialogHeader>
            {viewingSubmission && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Service Type</p>
                    <p className="text-lg font-semibold capitalize">
                      {viewingSubmission.service_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    {getRequestStatusBadge(viewingSubmission.status)}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                    <p className="text-sm">
                      {new Date(viewingSubmission.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                    <p className="text-sm">
                      {new Date(viewingSubmission.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Uploaded Documents Section */}
                {viewingSubmission.form_data?.attachments && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Uploaded Documents</h4>
                    <div className="space-y-2">
                      {viewingSubmission.form_data.attachments.supportingLetter && (
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Supporting Letter</p>
                              <p className="text-xs text-muted-foreground">
                                {viewingSubmission.form_data.attachments.supportingLetter.original_name}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const path = viewingSubmission.form_data.attachments.supportingLetter.path;
                              window.open(`http://localhost:8000/storage/${path}`, '_blank');
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      )}
                      {viewingSubmission.form_data.attachments.officialLetter && (
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Official Letter</p>
                              <p className="text-xs text-muted-foreground">
                                {viewingSubmission.form_data.attachments.officialLetter.original_name}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const path = viewingSubmission.form_data.attachments.officialLetter.path;
                              window.open(`http://localhost:8000/storage/${path}`, '_blank');
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      )}
                      {viewingSubmission.form_data.attachments.documents?.map((doc: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Document {index + 1}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.original_name}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              window.open(`http://localhost:8000/storage/${doc.path}`, '_blank');
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Form Data</h4>
                  <div className="space-y-3">
                    {Object.entries(viewingSubmission.form_data || {}).map(([key, value]) => {
                      if (key === 'attachments' || key === 'agree') return null;
                      return (
                        <div key={key} className="grid grid-cols-3 gap-2">
                          <p className="text-sm font-medium text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-sm col-span-2">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {viewingSubmission.review_notes && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Review Notes</h4>
                    <p className="text-sm text-muted-foreground">
                      {viewingSubmission.review_notes}
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingSubmission(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deletingSubmission} onOpenChange={() => setDeletingSubmission(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Service Request?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this service request? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {deletingSubmission && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Reference: {deletingSubmission.reference_number}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {deletingSubmission.service_type} Request
                </p>
              </div>
            )}
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDeletingSubmission(null)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => deleteMutation.mutate(deletingSubmission.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Track Request Dialog */}
        <Dialog open={showTrackDialog} onOpenChange={setShowTrackDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Track Existing Request</DialogTitle>
              <DialogDescription>
                Enter a reference number to track a request that was submitted outside the dashboard
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reference">Reference Number</Label>
                <Input
                  id="reference"
                  placeholder="e.g., RSH-20260710-ABC123"
                  value={trackingReference}
                  onChange={(e) => setTrackingReference(e.target.value.toUpperCase())}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Format: RSH-YYYYMMDD-XXXXXX (Research), TTR- (Transformation), LIC- (Licensing)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowTrackDialog(false);
                  setTrackingReference("");
                }}
                disabled={trackMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => trackMutation.mutate(trackingReference)}
                disabled={trackMutation.isPending || !trackingReference}
              >
                {trackMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Track Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
