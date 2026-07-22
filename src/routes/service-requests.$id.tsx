import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { getAuthToken } from "@/lib/api";
import {
  ArrowLeft,
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Hash,
  User,
  Calendar,
  FileText,
  ClipboardCheck,
  Building2,
  Save,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/service-requests/$id")({
  component: () => (
    <RequireAuth>
      <ServiceRequestDetailPage />
    </RequireAuth>
  ),
});

// ── Constants ────────────────────────────────────────────────────────────────
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

// ── Helpers ──────────────────────────────────────────────────────────────────
function prettifyKey(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

// ── Page ─────────────────────────────────────────────────────────────────────
function ServiceRequestDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Debug: Log the ID
  console.log("Service Request Detail Page - ID:", id);

  // Dialog targets
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  // Dialog field state
  const [assignUserId, setAssignUserId] = useState("");
  const [assignNote, setAssignNote] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewNote, setReviewNote] = useState("");

  // ── Queries ────────────────────────────────────────────────────────────
  const { data: submissionData, isLoading, error } = useQuery({
    queryKey: ["service-form", id],
    queryFn: async () => {
      console.log("Fetching service form with ID:", id);
      const res = await fetch(`/api/service-forms/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      console.log("Response status:", res.status);
      if (!res.ok) {
        const errorData = await res.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.message || "Failed to fetch submission");
      }
      const data = await res.json();
      console.log("Fetched data:", data);
      return data;
    },
  });

  // Get assignable users based on hierarchy
  const { data: assignableUsersData } = useQuery({
    queryKey: ["assignable-users"],
    queryFn: async () => {
      const res = await fetch(`/api/service-forms/assignable-users`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch assignable users");
      return res.json();
    },
  });

  // ── Mutations ──────────────────────────────────────────────────────────
  const assignMutation = useMutation({
    mutationFn: async ({ userId, note }: { userId: string; note: string }) => {
      const res = await fetch(`/api/service-forms/${id}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ assigned_to: Number(userId), notes: note }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Assignment failed");
      return json;
    },
    onSuccess: () => {
      toast({ title: "✅ Assigned", description: "Submission assigned successfully." });
      queryClient.invalidateQueries({ queryKey: ["service-form", id] });
      setAssignDialogOpen(false);
      setAssignUserId("");
      setAssignNote("");
    },
    onError: (e: Error) =>
      toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: string; notes: string }) => {
      const res = await fetch(`/api/service-forms/${id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ status, review_notes: notes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Review failed");
      return json;
    },
    onSuccess: () => {
      toast({ title: "✅ Updated", description: "Status updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["service-form", id] });
      setReviewDialogOpen(false);
      setReviewStatus("");
      setReviewNote("");
    },
    onError: (e: Error) =>
      toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // ── Derived ────────────────────────────────────────────────────────────
  const submission = submissionData?.data;
  const assignableUsers: any[] = assignableUsersData?.data ?? [];
  const hasHierarchyAccess = assignableUsers.length > 0;
  
  // Check if current user is assigned to this submission
  const isAssignedToSubmission = submission?.reviewed_by?.id === submission?.reviewed_by || 
                                 (typeof submission?.reviewed_by === 'number');
  
  // Assigned reviewers can update status but not reassign
  const canUpdateStatus = hasHierarchyAccess || isAssignedToSubmission;
  const canReassign = hasHierarchyAccess;

  function openAssignDialog() {
    setAssignUserId(String(submission?.reviewed_by ?? ""));
    setAssignNote("");
    setAssignDialogOpen(true);
  }

  function openReviewDialog() {
    setReviewStatus(submission?.status ?? "pending");
    setReviewNote(submission?.review_notes ?? "");
    setReviewDialogOpen(true);
  }

  if (isLoading) {
    console.log("Loading submission...");
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p>Loading service request #{id}...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    console.error("Error loading submission:", error);
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-lg font-medium text-red-600">Error loading submission</p>
          <p className="text-sm text-muted-foreground mt-2">{(error as Error).message}</p>
          <Button className="mt-4" onClick={() => navigate({ to: "/service-requests" })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Button>
        </div>
      </AppShell>
    );
  }

  if (!submission) {
    console.log("No submission data found");
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-lg font-medium">Submission not found</p>
          <p className="text-sm text-muted-foreground mt-2">Request ID: {id}</p>
          <Button className="mt-4" onClick={() => navigate({ to: "/service-requests" })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Button>
        </div>
      </AppShell>
    );
  }

  console.log("Rendering submission:", submission);

  return (
    <AppShell>
      <PageHeader
        title="Service Request Details"
        subtitle={`Reference: ${submission.reference_number}`}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/service-requests" })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="border-border/60">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Service Type</p>
                  <Badge
                    className={`text-xs ${
                      SERVICE_TYPE_COLORS[submission.service_type] ?? ""
                    }`}
                  >
                    {SERVICE_TYPE_LABELS[submission.service_type] ??
                      submission.service_type}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge
                    className={`text-xs flex w-fit items-center gap-1 ${
                      STATUS_STYLES[submission.status] ?? ""
                    }`}
                  >
                    {STATUS_ICON[submission.status]}
                    {submission.status?.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Submitted By</p>
                  <p className="text-sm font-medium mt-1">
                    {submission.submitted_name ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {submission.submitted_email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Submitted At</p>
                  <p className="text-sm mt-1">
                    {new Date(
                      submission.submission_timestamp ?? submission.created_at
                    ).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Assigned To</p>
                  {submission.reviewed_by ? (
                    <p className="text-sm font-medium text-blue-700 flex items-center gap-1 mt-1">
                      <User className="h-3.5 w-3.5" />
                      {typeof submission.reviewed_by === 'object' 
                        ? submission.reviewed_by.name 
                        : `User #${submission.reviewed_by}`}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic mt-1">Unassigned</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Data */}
          <Card className="border-border/60">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Form Data
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {Object.entries(submission.form_data ?? {})
                  .filter(([k]) => k !== "attachments" && k !== "agree")
                  .map(([key, val]) => (
                    <div
                      key={key}
                      className="grid grid-cols-[180px_1fr] gap-3 items-start border-b border-border/20 pb-3 last:border-0 last:pb-0"
                    >
                      <span className="text-xs font-medium text-muted-foreground">
                        {prettifyKey(key)}
                      </span>
                      <span className="text-sm break-words">
                        {typeof val === "object"
                          ? JSON.stringify(val)
                          : String(val ?? "—")}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Review Notes */}
          {submission.review_notes && (
            <Card className="border-blue-200 bg-blue-50/60">
              <CardHeader className="pb-4 border-b border-blue-200">
                <CardTitle className="text-sm font-semibold text-blue-900">
                  Review Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm whitespace-pre-wrap">{submission.review_notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="text-sm font-semibold">Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {canReassign && (
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={openAssignDialog}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign to User
                </Button>
              )}
              {canUpdateStatus && (
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={openReviewDialog}
                >
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Update Status
                </Button>
              )}
              {!canUpdateStatus && !canReassign && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No actions available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card className="border-border/60">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="text-sm font-semibold">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono font-bold">{submission.reference_number}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  {new Date(
                    submission.submission_timestamp ?? submission.created_at
                  ).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              {submission.form_data?.institution && (
                <div className="flex items-start gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                  <span>{submission.form_data.institution}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          DIALOGS
      ══════════════════════════════════════════════════════════════════ */}

      {/* ── Assign to User ── */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> Assign to User
            </DialogTitle>
            <DialogDescription>
              Assign{" "}
              <span className="font-mono font-bold text-foreground">
                {submission.reference_number}
              </span>{" "}
              to a staff member for review
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-semibold block mb-1.5">
                Assign To <span className="text-red-500">*</span>
              </label>
              <Select value={assignUserId} onValueChange={setAssignUserId}>
                <SelectTrigger id="assign-user-select" className="h-10">
                  <SelectValue placeholder="Select a staff member" />
                </SelectTrigger>
                <SelectContent>
                  {assignableUsers.map((u: any) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm">{u.name}</span>
                          <span className="text-xs text-muted-foreground">{u.email}</span>
                          {u.roles && u.roles.length > 0 && (
                            <span className="text-[10px] text-blue-600">
                              {u.roles[0].display_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {assignableUsers.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Showing {assignableUsers.length} user(s) in your management hierarchy
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5">
                Note <span className="text-xs font-normal text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                id="assign-note"
                placeholder="Assignment instructions or context…"
                rows={3}
                value={assignNote}
                onChange={(e) => setAssignNote(e.target.value)}
                className="resize-none text-sm"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <Button
                id="assign-submit-btn"
                className="flex-1 bg-gradient-primary text-primary-foreground"
                disabled={!assignUserId || assignMutation.isPending}
                onClick={() => assignMutation.mutate({ userId: assignUserId, note: assignNote })}
              >
                {assignMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assigning…
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign
                  </>
                )}
              </Button>
              <Button
                id="assign-cancel-btn"
                variant="outline"
                onClick={() => setAssignDialogOpen(false)}
                disabled={assignMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Update Status ── */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" /> Update Status
            </DialogTitle>
            <DialogDescription>
              Change the status of{" "}
              <span className="font-mono font-bold text-foreground">
                {submission.reference_number}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-semibold block mb-1.5">
                New Status <span className="text-red-500">*</span>
              </label>
              <Select value={reviewStatus} onValueChange={setReviewStatus}>
                <SelectTrigger id="review-status-select" className="h-10">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { v: "pending", l: "Pending" },
                    { v: "under_review", l: "Under Review" },
                    { v: "approved", l: "Approved" },
                    { v: "rejected", l: "Rejected" },
                  ].map(({ v, l }) => (
                    <SelectItem key={v} value={v}>
                      <div className="flex items-center gap-2">
                        {STATUS_ICON[v]}
                        {l}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5">Review Notes</label>
              <Textarea
                id="review-notes"
                placeholder="Add feedback, reasons or instructions for the submitter…"
                rows={4}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="resize-none text-sm"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <Button
                id="review-submit-btn"
                className="flex-1 bg-gradient-primary text-primary-foreground"
                disabled={!reviewStatus || reviewMutation.isPending}
                onClick={() =>
                  reviewMutation.mutate({ status: reviewStatus, notes: reviewNote })
                }
              >
                {reviewMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                id="review-cancel-btn"
                variant="outline"
                onClick={() => setReviewDialogOpen(false)}
                disabled={reviewMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
