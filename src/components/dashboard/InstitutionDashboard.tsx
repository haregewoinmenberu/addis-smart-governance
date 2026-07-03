import { useQuery } from "@tanstack/react-query";
import { Building2, FileText, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { apiGet } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
  form_data: any;
}

export function InstitutionDashboard() {
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
            `/institutions/${institutionData.data.id}/requests`
          )
        : null,
    enabled: !!institutionData?.data?.id,
  });

  const institution = institutionData?.data;
  const requests = requestsData?.data?.data || [];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, icon: Clock, label: "Pending" },
      ACTIVE: { variant: "default" as const, icon: CheckCircle2, label: "Active" },
      SUSPENDED: { variant: "destructive" as const, icon: XCircle, label: "Suspended" },
      INACTIVE: { variant: "outline" as const, icon: AlertCircle, label: "Inactive" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getRequestStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending" },
      approved: { variant: "default" as const, label: "Approved" },
      rejected: { variant: "destructive" as const, label: "Rejected" },
      in_progress: { variant: "outline" as const, label: "In Progress" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (institutionLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
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
            Your account is not associated with any institution. Please contact support for assistance.
          </p>
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "pending").length;
  const approvedRequests = requests.filter((r) => r.status === "approved").length;
  const totalRequests = requests.length;

  return (
    <div className="space-y-6">
      {/* Institution Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <CardTitle className="text-2xl">{institution.name}</CardTitle>
                <CardDescription className="mt-1">
                  {institution.type.replace(/_/g, " ")}
                </CardDescription>
              </div>
            </div>
            {getStatusBadge(institution.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm mt-1">{institution.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-sm mt-1">{institution.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Verification Status</p>
              <p className="text-sm mt-1">
                {institution.verified_at ? (
                  <span className="text-green-600 dark:text-green-400">Verified</span>
                ) : (
                  <span className="text-yellow-600 dark:text-yellow-400">Pending Verification</span>
                )}
              </p>
            </div>
          </div>

          {!institution.verified_at && (
            <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    Account Pending Verification
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Your institution account is pending verification by STRP administrators. You'll receive
                    an email once your account is approved and activated.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">All service requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Service Requests</CardTitle>
          <CardDescription>Manage and track your institution's service requests</CardDescription>
        </CardHeader>
        <CardContent>
          {requestsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm font-medium mb-1">No service requests yet</p>
              <p className="text-sm text-muted-foreground">
                Submit service requests through the public portal
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-mono text-sm font-medium">{request.reference_number}</p>
                      {getRequestStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {request.service_type.replace(/_/g, " ").toUpperCase()} •{" "}
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="text-sm font-medium text-primary hover:underline">View Details</button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
