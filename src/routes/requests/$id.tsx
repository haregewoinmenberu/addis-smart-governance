import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit, Trash2, Send, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { WorkflowTimeline } from "@/components/workflow/WorkflowTimeline";
import { Can } from "@/components/rbac/Can";
import { getRequest, deleteRequest, submitRequest } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/requests/$id")({
  component: RequestDetailsPage,
});

function RequestDetailsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  // Fetch request details
  const { data, isLoading } = useQuery({
    queryKey: ["request", id],
    queryFn: () => getRequest(id),
  });

  const request = data?.data;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteRequest(id),
    onSuccess: () => {
      toast.success("Request deleted successfully");
      navigate({ to: "/requests" });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete request");
    },
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: () => submitRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      toast.success("Request submitted successfully");
      setShowSubmitDialog(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit request");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Not Found</h2>
          <Button onClick={() => navigate({ to: "/requests" })}>Back to Requests</Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      in_progress: "bg-blue-100 text-blue-800",
    };
    return variants[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      Low: "bg-gray-100 text-gray-800",
      Medium: "bg-blue-100 text-blue-800",
      High: "bg-orange-100 text-orange-800",
      Critical: "bg-red-100 text-red-800",
    };
    return variants[priority] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/requests" })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{request.title}</h1>
            <p className="text-gray-600 mt-1">{request.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {request.approval_status === "draft" && (
            <Can permission="create_requests">
              <Button onClick={() => setShowSubmitDialog(true)}>
                <Send className="h-4 w-4 mr-2" />
                Submit for Approval
              </Button>
            </Can>
          )}
          <Can permission="edit_requests">
            <Button
              variant="outline"
              onClick={() => navigate({ to: `/requests/${id}/edit` })}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Can>
          <Can permission="delete_requests">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </Can>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Status</div>
            <Badge className={getStatusBadge(request.approval_status)}>
              {request.approval_status.replace(/_/g, " ").toUpperCase()}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Priority</div>
            <Badge className={getPriorityBadge(request.priority)}>
              {request.priority}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Progress</div>
            <div className="text-2xl font-bold">
              {request.step}/{request.total_steps}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Budget</div>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "ETB",
                minimumFractionDigits: 0,
              }).format(request.budget || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Details */}
      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Category</div>
              <div className="text-base">{request.category}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Office</div>
              <div className="text-base">{request.office}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Submitted By</div>
              <div className="text-base">{request.submittedBy?.name || "N/A"}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Submitted At</div>
              <div className="text-base">
                {new Date(request.submitted_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Description</div>
            <div className="text-base whitespace-pre-wrap">{request.description}</div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Justification</div>
            <div className="text-base whitespace-pre-wrap">{request.justification}</div>
          </div>

          {request.documents && request.documents.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">Documents</div>
              <div className="space-y-2">
                {request.documents.map((doc: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <span className="text-sm">{doc}</span>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Timeline */}
      {request.workflow_instance && (
        <WorkflowTimeline instance={request.workflow_instance} />
      )}

      {/* Duplication Analysis */}
      {request.duplicationCase && (
        <Card>
          <CardHeader>
            <CardTitle>Duplication Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">
                  Similarity Score
                </div>
                <div className="text-2xl font-bold">
                  {request.duplicationCase.similarity_score}%
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">
                  Recommendation
                </div>
                <Badge>{request.duplicationCase.recommendation}</Badge>
              </div>
              {request.duplicationCase.analysis_notes && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Notes</div>
                  <div className="text-base">{request.duplicationCase.analysis_notes}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feasibility Study */}
      {request.feasibilityStudy && (
        <Card>
          <CardHeader>
            <CardTitle>Feasibility Study</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Technical</div>
                <div className="text-2xl font-bold">
                  {request.feasibilityStudy.technical_score}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Financial</div>
                <div className="text-2xl font-bold">
                  {request.feasibilityStudy.financial_score}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Security</div>
                <div className="text-2xl font-bold">
                  {request.feasibilityStudy.security_score}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Infrastructure</div>
                <div className="text-2xl font-bold">
                  {request.feasibilityStudy.infrastructure_score}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Integration</div>
                <div className="text-2xl font-bold">
                  {request.feasibilityStudy.integration_score}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Overall Risk</div>
                <div className="text-2xl font-bold">
                  {request.feasibilityStudy.overall_risk_score}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Dialog */}
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Request"
        description="Are you sure you want to delete this request? This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Request for Approval</DialogTitle>
            <DialogDescription>
              Once submitted, this request will enter the approval workflow and cannot be
              edited until it's returned for revision.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSubmitDialog(false)}
              disabled={submitMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
