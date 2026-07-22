import { createFileRoute } from "@tanstack/react-router";
import { getAuthToken, getUsers } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search, MoreVertical, UserPlus, CheckCircle2, XCircle,
  Clock, AlertCircle, RefreshCw, Hash, User, Calendar, FileText,
  Eye, ClipboardCheck, Building2, Edit, Trash2, Save, Loader2,
} from "lucide-react";

export const Route = createFileRoute("/service-requests/")({
  component: () => (
    <RequireAuth>
      <ServiceRequestsPage />
    </RequireAuth>
  ),
});

// ── Constants ────────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  pending:      "bg-amber-500/10 text-amber-700 border-amber-500/20",
  under_review: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  approved:     "bg-green-500/10 text-green-700 border-green-500/20",
  rejected:     "bg-red-500/10 text-red-700 border-red-500/20",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending:      <Clock className="h-3.5 w-3.5" />,
  under_review: <AlertCircle className="h-3.5 w-3.5" />,
  approved:     <CheckCircle2 className="h-3.5 w-3.5" />,
  rejected:     <XCircle className="h-3.5 w-3.5" />,
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  research:       "Research",
  transformation: "Digital Transformation",
  licensing:      "Licensing",
  lms:            "LMS Enrollment",
};

const SERVICE_TYPE_COLORS: Record<string, string> = {
  research:       "bg-violet-100 text-violet-700 border-violet-200",
  transformation: "bg-blue-100 text-blue-700 border-blue-200",
  licensing:      "bg-amber-100 text-amber-700 border-amber-200",
  lms:            "bg-green-100 text-green-700 border-green-200",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function prettifyKey(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

// ── Page ─────────────────────────────────────────────────────────────────────
function ServiceRequestsPage() {
  const { toast }   = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Filter state
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType,   setFilterType]   = useState("");

  // Dialog targets
  const [assignTarget, setAssignTarget] = useState<any | null>(null);
  const [reviewTarget, setReviewTarget] = useState<any | null>(null);
  const [editTarget,   setEditTarget]   = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  // Dialog field state
  const [assignUserId, setAssignUserId] = useState("");
  const [assignNote,   setAssignNote]   = useState("");
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewNote,   setReviewNote]   = useState("");
  const [editFields,   setEditFields]   = useState<Record<string, string>>({});

  // ── Queries ────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["service-forms-all", search, filterStatus, filterType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search)       params.append("search", search);
      if (filterStatus) params.append("status", filterStatus);
      if (filterType)   params.append("service_type", filterType);
      const res = await fetch(`/api/service-forms?${params}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch submissions");
      return res.json();
    },
  });

  const { data: usersData } = useQuery({
    queryKey: ["users-list"],
    queryFn: () => getUsers(),
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
    mutationFn: async ({ id, userId, note }: { id: number; userId: string; note: string }) => {
      const res = await fetch(`/api/service-forms/${id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ assigned_to: Number(userId), notes: note }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Assignment failed");
      return json;
    },
    onSuccess: () => {
      toast({ title: "✅ Assigned", description: "Submission assigned successfully." });
      queryClient.invalidateQueries({ queryKey: ["service-forms-all"] });
      setAssignTarget(null); setAssignUserId(""); setAssignNote("");
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes: string }) => {
      const res = await fetch(`/api/service-forms/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ status, review_notes: notes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Review failed");
      return json;
    },
    onSuccess: () => {
      toast({ title: "✅ Updated", description: "Status updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["service-forms-all"] });
      setReviewTarget(null); setReviewStatus(""); setReviewNote("");
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: Record<string, string> }) => {
      const res = await fetch(`/api/service-forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ formData }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Edit failed");
      return json;
    },
    onSuccess: () => {
      toast({ title: "✅ Saved", description: "Submission updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["service-forms-all"] });
      setEditTarget(null); setEditFields({});
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/service-forms/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Delete failed");
      return json;
    },
    onSuccess: () => {
      toast({ title: "🗑️ Deleted", description: "Submission deleted." });
      queryClient.invalidateQueries({ queryKey: ["service-forms-all"] });
      setDeleteTarget(null);
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      setDeleteTarget(null);
    },
  });

  // ── Derived ────────────────────────────────────────────────────────────
  const submissions: any[] = data?.data ?? [];
  const users: any[]       = usersData?.data ?? [];
  const assignableUsers: any[] = assignableUsersData?.data ?? [];
  
  // Check if user has hierarchy-based access (can assign to others)
  const hasHierarchyAccess = assignableUsers.length > 0;
  
  // Check if user is an assigned reviewer (receives assigned tasks but can't assign to others)
  const isAssignedReviewer = !hasHierarchyAccess && submissions.length > 0;

  const stats = {
    total:        data?.pagination?.total ?? submissions.length,
    pending:      submissions.filter((s) => s.status === "pending").length,
    under_review: submissions.filter((s) => s.status === "under_review").length,
    approved:     submissions.filter((s) => s.status === "approved").length,
    rejected:     submissions.filter((s) => s.status === "rejected").length,
  };

  // Open edit dialog with a copy of form_data fields (exclude attachments/agree)
  function openEdit(sub: any) {
    const fields: Record<string, string> = {};
    for (const [k, v] of Object.entries(sub.form_data ?? {})) {
      if (k !== "attachments" && k !== "agree") {
        fields[k] = String(v ?? "");
      }
    }
    setEditFields(fields);
    setEditTarget(sub);
  }

  return (
    <AppShell>
      <PageHeader
        title="Service Form Requests"
        subtitle={
          hasHierarchyAccess 
            ? "All submitted service forms — view, assign reviewers and manage statuses"
            : isAssignedReviewer
            ? "Service requests assigned to you — view and update status"
            : "All submitted service forms — view, edit, assign reviewers and manage statuses"
        }
        actions={
          <Button
            id="refresh-requests-btn"
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["service-forms-all"] })}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        }
      />

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total",        value: stats.total,        color: "text-foreground",  bg: "bg-primary/5" },
          { label: "Pending",      value: stats.pending,      color: "text-amber-600",   bg: "bg-amber-50" },
          { label: "Under Review", value: stats.under_review, color: "text-blue-600",    bg: "bg-blue-50" },
          { label: "Approved",     value: stats.approved,     color: "text-green-600",   bg: "bg-green-50" },
          { label: "Rejected",     value: stats.rejected,     color: "text-red-600",     bg: "bg-red-50" },
        ].map((s) => (
          <Card key={s.label} className={`border-border/60 ${s.bg}`}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Filters ── */}
      <Card className="mb-4 border-border/60">
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="requests-search"
                placeholder="Search by reference, name, or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              id="requests-type-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background text-sm min-w-[170px]"
            >
              <option value="">All Types</option>
              <option value="research">Research</option>
              <option value="transformation">Digital Transformation</option>
              <option value="licensing">Licensing</option>
              <option value="lms">LMS</option>
            </select>
            <select
              id="requests-status-filter"
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

      {/* ── Submissions table ── */}
      <Card className="border-border/60">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            All Submitted Forms
            {data?.pagination?.total != null && (
              <Badge variant="outline" className="ml-1">{data.pagination.total}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-border/40">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-28" />
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-4 bg-muted rounded flex-1" />
                  <div className="h-4 bg-muted rounded w-20" />
                  <div className="h-4 bg-muted rounded w-16" />
                </div>
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                <ClipboardCheck className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No submissions found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {submissions.map((sub: any) => (
                <div
                  key={sub.id}
                  className="flex items-start gap-3 px-4 py-4 hover:bg-muted/30 transition-colors group"
                >
                  {/* Reference + type */}
                  <div className="min-w-[130px] shrink-0">
                    <p className="text-xs font-mono font-bold text-primary flex items-center gap-1">
                      <Hash className="h-3 w-3" />{sub.reference_number}
                    </p>
                    <Badge className={`text-[10px] mt-1 ${SERVICE_TYPE_COLORS[sub.service_type] ?? ""}`}>
                      {SERVICE_TYPE_LABELS[sub.service_type] ?? sub.service_type}
                    </Badge>
                  </div>

                  {/* Submitter */}
                  <div className="min-w-[150px] shrink-0">
                    <p className="text-xs font-medium flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      {sub.submitted_name ?? "—"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate max-w-[145px]">
                      {sub.submitted_email ?? ""}
                    </p>
                  </div>

                  {/* Content preview */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {sub.form_data?.researchTitle
                        || sub.form_data?.agencyName
                        || sub.form_data?.fullName
                        || "—"}
                    </p>
                    {sub.form_data?.institution && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3" /> {sub.form_data.institution}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {new Date(sub.submission_timestamp ?? sub.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Assigned to */}
                  <div className="min-w-[120px] shrink-0">
                    {sub.reviewed_by ? (
                      <p className="text-[11px] text-blue-700 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {sub.reviewed_by?.name ?? `User #${sub.reviewed_by}`}
                      </p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground italic">Unassigned</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="shrink-0">
                    <Badge className={`text-[11px] flex items-center gap-1 ${STATUS_STYLES[sub.status] ?? ""}`}>
                      {STATUS_ICON[sub.status]}
                      {sub.status?.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  {/* Quick action buttons (visible on hover) + dropdown */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      id={`view-sub-${sub.id}`}
                      variant="ghost" size="sm" className="h-7 w-7 p-0"
                      title="View details"
                      onClick={() => navigate({ to: `/service-requests/${sub.id}` })}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    {!hasHierarchyAccess && sub.status === "pending" && (
                      <Button
                        id={`edit-sub-${sub.id}`}
                        variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50"
                        title="Edit form data"
                        onClick={() => openEdit(sub)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {!hasHierarchyAccess && sub.status === "pending" && (
                      <Button
                        id={`delete-sub-${sub.id}`}
                        variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                        title="Delete submission"
                        onClick={() => setDeleteTarget(sub)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  {/* Full dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button id={`actions-${sub.id}`} variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem onClick={() => navigate({ to: `/service-requests/${sub.id}` })}>
                        <Eye className="h-4 w-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {hasHierarchyAccess && (
                        <DropdownMenuItem
                          onClick={() => { setAssignTarget(sub); setAssignUserId(String(sub.reviewed_by ?? "")); setAssignNote(""); }}
                        >
                          <UserPlus className="h-4 w-4 mr-2" /> Assign to User
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => { setReviewTarget(sub); setReviewStatus(sub.status); setReviewNote(sub.review_notes ?? ""); }}
                      >
                        <ClipboardCheck className="h-4 w-4 mr-2" /> Update Status
                      </DropdownMenuItem>
                      {!hasHierarchyAccess && !isAssignedReviewer && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className={sub.status !== "pending" ? "opacity-40 cursor-not-allowed" : ""}
                            onClick={() => sub.status === "pending" && openEdit(sub)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Form Data
                            {sub.status !== "pending" && (
                              <span className="ml-auto text-[10px] text-muted-foreground">pending only</span>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={sub.status !== "pending" ? "text-muted-foreground opacity-40 cursor-not-allowed" : "text-red-600 focus:text-red-600 focus:bg-red-50"}
                            onClick={() => sub.status === "pending" && setDeleteTarget(sub)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                            {sub.status !== "pending" && (
                              <span className="ml-auto text-[10px]">pending only</span>
                            )}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════
          DIALOGS
      ══════════════════════════════════════════════════════════════════ */}

      {/* ── Edit Form Data ── */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Edit Submission
            </DialogTitle>
            <DialogDescription className="font-mono font-bold text-foreground text-sm">
              {editTarget?.reference_number}
            </DialogDescription>
          </DialogHeader>

          {editTarget && (
            <div className="space-y-4 pt-1">
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-xs text-amber-700">
                ⚠️ Only pending submissions can be edited. Changes replace the original form data.
              </div>

              {/* Editable fields */}
              <div className="space-y-3">
                {Object.entries(editFields).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      {prettifyKey(key)}
                    </label>
                    {value.length > 80 ? (
                      <Textarea
                        id={`edit-field-${key}`}
                        value={value}
                        onChange={(e) => setEditFields((f) => ({ ...f, [key]: e.target.value }))}
                        rows={3}
                        className="resize-none text-sm"
                      />
                    ) : (
                      <Input
                        id={`edit-field-${key}`}
                        value={value}
                        onChange={(e) => setEditFields((f) => ({ ...f, [key]: e.target.value }))}
                        className="h-9 text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  id="edit-save-btn"
                  className="flex-1 bg-gradient-primary text-primary-foreground"
                  disabled={editMutation.isPending}
                  onClick={() => editMutation.mutate({ id: editTarget.id, formData: editFields })}
                >
                  {editMutation.isPending
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</>
                    : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                </Button>
                <Button id="edit-cancel-btn" variant="outline" disabled={editMutation.isPending} onClick={() => setEditTarget(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Assign to User ── */}
      <Dialog open={!!assignTarget} onOpenChange={(o) => !o && setAssignTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> Assign to User
            </DialogTitle>
            <DialogDescription>
              Assign <span className="font-mono font-bold text-foreground">{assignTarget?.reference_number}</span> to a staff member for review
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-semibold block mb-1.5">Staff Member <span className="text-red-500">*</span></label>
              <Select value={assignUserId} onValueChange={setAssignUserId}>
                <SelectTrigger id="assign-user-select" className="h-10">
                  <SelectValue placeholder="Select a staff member" />
                </SelectTrigger>
                <SelectContent>
                  {(hasHierarchyAccess ? assignableUsers : users).map((u: any) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm">{u.name}</span>
                          <span className="text-xs text-muted-foreground">{u.email}</span>
                          {u.roles && u.roles.length > 0 && (
                            <span className="text-[10px] text-blue-600">{u.roles[0].display_name}</span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasHierarchyAccess && assignableUsers.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Showing {assignableUsers.length} user(s) in your management hierarchy
                </p>
              )}
              {hasHierarchyAccess && assignableUsers.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No users available in your hierarchy to assign
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5">
                Note <span className="text-xs font-normal text-muted-foreground">(optional)</span>
              </label>
              <Textarea id="assign-note" placeholder="Assignment instructions or context…" rows={3} value={assignNote} onChange={(e) => setAssignNote(e.target.value)} className="resize-none text-sm" />
            </div>
            <div className="flex gap-3 pt-1">
              <Button id="assign-submit-btn" className="flex-1 bg-gradient-primary text-primary-foreground" disabled={!assignUserId || assignMutation.isPending}
                onClick={() => assignMutation.mutate({ id: assignTarget.id, userId: assignUserId, note: assignNote })}>
                {assignMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Assigning…</> : <><UserPlus className="h-4 w-4 mr-2" />Assign</>}
              </Button>
              <Button id="assign-cancel-btn" variant="outline" onClick={() => setAssignTarget(null)} disabled={assignMutation.isPending}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Update Status ── */}
      <Dialog open={!!reviewTarget} onOpenChange={(o) => !o && setReviewTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" /> Update Status
            </DialogTitle>
            <DialogDescription>
              Change the status of <span className="font-mono font-bold text-foreground">{reviewTarget?.reference_number}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-semibold block mb-1.5">New Status <span className="text-red-500">*</span></label>
              <Select value={reviewStatus} onValueChange={setReviewStatus}>
                <SelectTrigger id="review-status-select" className="h-10">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { v: "pending",      l: "Pending" },
                    { v: "under_review", l: "Under Review" },
                    { v: "approved",     l: "Approved" },
                    { v: "rejected",     l: "Rejected" },
                  ].map(({ v, l }) => (
                    <SelectItem key={v} value={v}>
                      <div className="flex items-center gap-2">{STATUS_ICON[v]}{l}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5">Review Notes</label>
              <Textarea id="review-notes" placeholder="Add feedback, reasons or instructions for the submitter…" rows={4} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} className="resize-none text-sm" />
            </div>
            <div className="flex gap-3 pt-1">
              <Button id="review-submit-btn" className="flex-1 bg-gradient-primary text-primary-foreground" disabled={!reviewStatus || reviewMutation.isPending}
                onClick={() => reviewMutation.mutate({ id: reviewTarget.id, status: reviewStatus, notes: reviewNote })}>
                {reviewMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><Save className="h-4 w-4 mr-2" />Save Changes</>}
              </Button>
              <Button id="review-cancel-btn" variant="outline" onClick={() => setReviewTarget(null)} disabled={reviewMutation.isPending}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-mono font-bold text-foreground">{deleteTarget?.reference_number}</span>?{" "}
              This action <strong>cannot be undone</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              id="confirm-delete-submission-btn"
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              {deleteMutation.isPending
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting…</>
                : <><Trash2 className="h-4 w-4 mr-2" />Delete</>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
