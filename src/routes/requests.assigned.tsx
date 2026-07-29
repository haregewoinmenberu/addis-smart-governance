import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getAuthToken } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, Eye, User, Calendar, Hash, FileText, 
  ClipboardCheck, Clock, CheckCircle2, XCircle, AlertCircle 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/requests/assigned")({
  component: () => (
    <RequireAuth>
      <AssignedRequestsPage />
    </RequireAuth>
  ),
});

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  under_review: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  approved: "bg-green-500/10 text-green-700 border-green-500/20",
  rejected: "bg-red-500/10 text-red-700 border-red-500/20",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5" />,
  under_review: <AlertCircle className="h-3.5 w-3.5" />,
  approved: <CheckCircle2 className="h-3.5 w-3.5" />,
  rejected: <XCircle className="h-3.5 w-3.5" />,
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  research: "Research",
  transformation: "Digital Transformation",
  licensing: "Licensing",
  lms: "LMS Enrollment",
};

const SERVICE_TYPE_COLORS: Record<string, string> = {
  research: "bg-violet-100 text-violet-700 border-violet-200",
  transformation: "bg-blue-100 text-blue-700 border-blue-200",
  licensing: "bg-amber-100 text-amber-700 border-amber-200",
  lms: "bg-green-100 text-green-700 border-green-200",
};

function AssignedRequestsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Fetch service requests and their assignments
  const { data: requestsData, isLoading } = useQuery({
    queryKey: ["assigned-service-requests", searchQuery, filterStatus],
    queryFn: async () => {
      // Get all service requests
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filterStatus) params.append("status", filterStatus);
      
      const res = await fetch(`/api/service-forms?${params}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch requests");
      const data = await res.json();
      
      const requests = data.data || [];
      
      // For each request, fetch assignments to check if user is assigned
      const assignedRequests = [];
      
      for (const request of requests) {
        try {
          const assignResponse = await fetch(`/api/service-request-workflow/requests/${request.id}/assignments`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          });
          
          if (assignResponse.ok) {
            const assignData = await assignResponse.json();
            const userAssignments = (assignData.data || []).filter((a: any) => 
              a.assigned_to && 
              typeof a.assigned_to === 'object' && 
              a.assigned_to.id === user?.id
            );
            
            if (userAssignments.length > 0) {
              assignedRequests.push({
                ...request,
                myAssignments: userAssignments,
              });
            }
          }
        } catch (err) {
          console.error(`Error fetching assignments for request ${request.id}:`, err);
        }
      }
      
      return { ...data, data: assignedRequests, assignedCount: assignedRequests.length };
    },
  });

  const requests: any[] = requestsData?.data ?? [];

  return (
    <AppShell>
      <PageHeader
        title="Assigned Requests"
        subtitle="Service requests assigned to you from Smart City Command Center"
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference number or name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background text-sm min-w-[150px]"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                <div className="h-3 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ClipboardCheck className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-base font-semibold mb-1">
              No assigned requests yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Service requests assigned to you will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">
              Showing {requests.length} assigned request{requests.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {requests.map((request: any) => (
            <Card
              key={request.id}
              className="hover:shadow-md transition-all border-border/60"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono font-bold text-sm">
                        {request.reference_number}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                      <User className="h-3 w-3" />
                      {request.submitted_name ?? "Unknown"}
                      <span className="text-border">·</span>
                      <Calendar className="h-3 w-3" />
                      {new Date(
                        request.submission_timestamp ?? request.created_at
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                    <Badge
                      className={`text-xs ${
                        SERVICE_TYPE_COLORS[request.service_type] ?? ""
                      }`}
                    >
                      {SERVICE_TYPE_LABELS[request.service_type] ??
                        request.service_type}
                    </Badge>
                    <Badge
                      className={`text-xs flex items-center gap-1 ${
                        STATUS_STYLES[request.status] ?? ""
                      }`}
                    >
                      {STATUS_ICON[request.status]}
                      {request.status?.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>

                {/* Form Data Preview */}
                {request.form_data?.researchTitle && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-foreground">
                      {request.form_data.researchTitle}
                    </p>
                  </div>
                )}

                {request.form_data?.institution && (
                  <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {request.form_data.institution}
                  </p>
                )}

                {/* Show user's assignments */}
                {request.myAssignments && request.myAssignments.length > 0 && (
                  <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Your Assignments:</p>
                    <div className="flex flex-wrap gap-2">
                      {request.myAssignments.map((assignment: any) => (
                        <Badge 
                          key={assignment.id}
                          className={
                            assignment.status === 'pending' ? 'bg-yellow-500' :
                            assignment.status === 'accepted' ? 'bg-blue-500' :
                            assignment.status === 'in_progress' ? 'bg-purple-500' :
                            assignment.status === 'completed' ? 'bg-green-500' :
                            'bg-red-500'
                          }
                        >
                          {assignment.assignment_type === 'team_leader' ? '👨‍💼' : '👨‍🔬'} 
                          {assignment.assignment_type.replace(/_/g, ' ')} - {assignment.status.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Notes */}
                {request.review_notes && (
                  <p className="text-xs text-muted-foreground bg-muted rounded px-2 py-1 mb-3 line-clamp-2">
                    💬 {request.review_notes}
                  </p>
                )}

                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() =>
                      navigate({ to: `/service-requests/${request.id}/workspace` })
                    }
                  >
                    <Eye className="h-3 w-3 mr-1" /> Open Workspace
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
