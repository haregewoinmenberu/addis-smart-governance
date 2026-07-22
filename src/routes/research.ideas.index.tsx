import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getAuthToken } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, Search, Eye, Edit, Trash2, FlaskConical,
  FileText, Clock, CheckCircle2, XCircle, AlertCircle,
  RefreshCw, Calendar, User, Hash, UserPlus, ClipboardCheck, MoreVertical, Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { researchCategoryLabels } from "@/lib/research-schema";
import { usePermissions } from "@/hooks/usePermissions";

export const Route = createFileRoute("/research/ideas/")({
  component: () => (
    <RequireAuth>
      <ResearchIdeasPage />
    </RequireAuth>
  ),
});

// ── Colour helpers ──────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  draft:        "bg-gray-500/10 text-gray-600 border-gray-400/30",
  submitted:    "bg-blue-500/10 text-blue-700 border-blue-500/20",
  under_review: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  approved:     "bg-green-500/10 text-green-700 border-green-500/20",
  rejected:     "bg-red-500/10 text-red-700 border-red-500/20",
  pending:      "bg-amber-500/10 text-amber-700 border-amber-500/20",
  reviewed:     "bg-blue-500/10 text-blue-700 border-blue-500/20",
};

const PRIORITY_STYLES: Record<string, string> = {
  low:      "bg-slate-100 text-slate-600 border-slate-200",
  medium:   "bg-blue-100 text-blue-600 border-blue-200",
  high:     "bg-orange-100 text-orange-600 border-orange-200",
  critical: "bg-red-100 text-red-600 border-red-200",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending:      <Clock className="h-3.5 w-3.5 text-amber-500" />,
  approved:     <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
  rejected:     <XCircle className="h-3.5 w-3.5 text-red-500" />,
  reviewed:     <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />,
  under_review: <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />,
};

// ── Page ────────────────────────────────────────────────────────────────────
function ResearchIdeasPage() {
  const navigate    = useNavigate();
  const { toast }   = useToast();
  const queryClient = useQueryClient();
  const { user }    = usePermissions();

  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
  const [assignTarget, setAssignTarget] = useState<any | null>(null);
  const [statusTarget, setStatusTarget] = useState<any | null>(null);
  const [assignUserId, setAssignUserId] = useState("");
  const [assignNote,   setAssignNote]   = useState("");
  const [newStatus,    setNewStatus]    = useState("");
  const [statusNote,   setStatusNote]   = useState("");

  // Research ideas list
  const { data: ideasData, isLoading: ideasLoading } = useQuery({
    queryKey: ["research-ideas", search, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search)       params.append("search", search);
      if (filterStatus) params.append("status", filterStatus);
      const res = await fetch(`/api/research-ideas?${params}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch ideas");
      return res.json();
    },
  });

  // Submitted service forms (research type) for the right-side panel
  const { data: submissionsData, isLoading: submissionsLoading } = useQuery({
    queryKey: ["service-form-submissions", "research"],
    queryFn: async () => {
      const res = await fetch(`/api/service-forms/my-submissions?service_type=research`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) return { data: [] };
      return res.json();
    },
  });

  // Get assignable users based on hierarchy
  const { data: assignableUsersData } = useQuery({
    queryKey: ["research-assignable-users"],
    queryFn: async () => {
      const res = await fetch(`/api/research-ideas/assignable-users`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch assignable users");
      return res.json();
    },
  });

  const ideas: any[]       = ideasData?.data ?? [];
  const submissions: any[] = submissionsData?.data ?? [];
  const assignableUsers: any[] = assignableUsersData?.data ?? [];
  const hasHierarchyAccess = assignableUsers.length > 0;
  
  // Check if user is assigned reviewer (can update status but not reassign)
  const isAssignedReviewer = !hasHierarchyAccess && ideas.some((idea: any) => idea.assigned_to_director === user?.id);

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: async ({ id, userId, note }: { id: number; userId: string; note: string }) => {
      const res = await fetch(`/api/research-ideas/${id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ assigned_to: Number(userId), notes: note }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Assignment failed");
      return json;
    },
    onSuccess: () => {
      toast({ title: "✅ Assigned", description: "Research idea assigned successfully." });
      queryClient.invalidateQueries({ queryKey: ["research-ideas"] });
      setAssignTarget(null);
      setAssignUserId("");
      setAssignNote("");
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes: string }) => {
      const res = await fetch(`/api/research-ideas/${id}/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ status, notes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Status update failed");
      return json;
    },
    onSuccess: () => {
      toast({ title: "✅ Updated", description: "Status updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["research-ideas"] });
      setStatusTarget(null);
      setNewStatus("");
      setStatusNote("");
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // Delete idea mutation
  const deleteIdea = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/research-ideas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Research idea deleted." });
      queryClient.invalidateQueries({ queryKey: ["research-ideas"] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Could not delete.", variant: "destructive" });
      setDeleteTarget(null);
    },
  });

  return (
    <AppShell>
      <PageHeader
        title="Research Ideas"
        subtitle="Submit and manage research proposals and innovation ideas"
        actions={
          <Button
            id="submit-new-idea-btn"
            size="sm"
            className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow"
            onClick={() => navigate({ to: "/research/ideas/create" })}
          >
            <Plus className="h-4 w-4" />
            Submit New Idea
          </Button>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* ── Left: ideas list (3 cols) ─────────────────────────────────── */}
        <div className="xl:col-span-3 space-y-4">

          {/* Filters */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="ideas-search"
                    placeholder="Search by title or summary…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  id="ideas-status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-border rounded-lg bg-background text-sm min-w-[150px]"
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Ideas */}
          {ideasLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader><div className="h-4 bg-muted rounded w-2/3" /></CardHeader>
                  <CardContent><div className="h-3 bg-muted rounded w-full" /></CardContent>
                </Card>
              ))}
            </div>
          ) : ideas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <FlaskConical className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-base font-semibold mb-1">No research ideas yet</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  {search || filterStatus
                    ? "Try adjusting your filters."
                    : "Submit your first research idea to get started."}
                </p>
                <Button id="empty-create-btn" onClick={() => navigate({ to: "/research/ideas/create" })}>
                  <Plus className="h-4 w-4 mr-2" /> Submit Your First Idea
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {ideas.map((idea: any) => (
                <Card key={idea.id} className="hover:shadow-md transition-all border-border/60">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm font-semibold truncate">{idea.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <User className="h-3 w-3" />
                          {idea.submitter?.name ?? "Unknown"}
                          <span className="text-border">·</span>
                          <Calendar className="h-3 w-3" />
                          {new Date(idea.created_at).toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" })}
                        </p>
                      </div>
                      <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                        <Badge className={`text-xs ${STATUS_STYLES[idea.status] ?? ""}`}>
                          {idea.status?.replace(/_/g," ")}
                        </Badge>
                        <Badge className={`text-xs ${PRIORITY_STYLES[idea.priority] ?? ""}`}>
                          {idea.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{idea.summary}</p>
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex gap-1.5 flex-wrap">
                        {idea.research_category && (
                          <Badge variant="outline" className="text-[11px]">
                            {researchCategoryLabels[idea.research_category as keyof typeof researchCategoryLabels] ?? idea.research_category}
                          </Badge>
                        )}
                        {idea.government_sector && (
                          <Badge variant="outline" className="text-[11px]">{idea.government_sector}</Badge>
                        )}
                        {idea.assigned_to_director && (
                          <Badge variant="outline" className="text-[11px] text-blue-700 border-blue-200">
                            <User className="h-3 w-3 mr-1" />
                            {typeof idea.assignedToDirector === 'object' ? idea.assignedToDirector?.name : `User #${idea.assigned_to_director}`}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          id={`view-idea-${idea.id}`}
                          variant="ghost" size="sm" className="h-7 px-2 text-xs"
                          onClick={() => navigate({ to: `/research/ideas/${idea.id}` })}
                        >
                          <Eye className="h-3 w-3 mr-1" /> View
                        </Button>
                        {["draft", "submitted"].includes(idea.status) && (user?.id === idea.submitter_id || user?.id === idea.submitter?.id) && (
                          <Button
                            id={`edit-idea-${idea.id}`}
                            variant="ghost" size="sm"
                            className="h-7 px-2 text-xs text-blue-600 hover:bg-blue-50"
                            onClick={() => navigate({ to: `/research/ideas/${idea.id}/edit` })}
                          >
                            <Edit className="h-3 w-3 mr-1" /> Edit
                          </Button>
                        )}
                        {["draft", "submitted"].includes(idea.status) && (user?.id === idea.submitter_id || user?.id === idea.submitter?.id) && (
                          <Button
                            id={`delete-idea-${idea.id}`}
                            variant="ghost" size="sm"
                            className="h-7 px-2 text-xs text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteTarget({ id: idea.id, title: idea.title })}
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                          </Button>
                        )}
                        {hasHierarchyAccess && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button id={`actions-${idea.id}`} variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuItem onClick={() => navigate({ to: `/research/ideas/${idea.id}` })}>
                                <Eye className="h-4 w-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setAssignTarget(idea);
                                  setAssignUserId(String(idea.assigned_to_director ?? ""));
                                  setAssignNote("");
                                }}
                              >
                                <UserPlus className="h-4 w-4 mr-2" /> Assign to User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setStatusTarget(idea);
                                  setNewStatus(idea.status);
                                  setStatusNote("");
                                }}
                              >
                                <ClipboardCheck className="h-4 w-4 mr-2" /> Update Status
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        {!hasHierarchyAccess && isAssignedReviewer && idea.assigned_to_director === user?.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button id={`actions-${idea.id}`} variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuItem onClick={() => navigate({ to: `/research/ideas/${idea.id}` })}>
                                <Eye className="h-4 w-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setStatusTarget(idea);
                                  setNewStatus(idea.status);
                                  setStatusNote("");
                                }}
                              >
                                <ClipboardCheck className="h-4 w-4 mr-2" /> Update Status
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {ideasData?.total > ideasData?.per_page && (
                <p className="text-center text-xs text-muted-foreground py-1">
                  Showing {ideas.length} of {ideasData.total} ideas
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Submitted forms panel (1 col) ──────────────────────── */}
        <div className="xl:col-span-1">
          <Card className="sticky top-6 border-border/60">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Submitted Forms
                </CardTitle>
                <Button
                  id="refresh-submissions-btn"
                  variant="ghost" size="sm" className="h-6 w-6 p-0"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["service-form-submissions"] })}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              <CardDescription className="text-xs">
                Your research service form submissions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-3 px-3 pb-3">
              {submissionsLoading ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}
                </div>
              ) : submissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">No submitted forms yet</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">
                    Research service forms appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                  {submissions.map((sub: any) => (
                    <div
                       key={sub.id}
                       className="p-2.5 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors"
                    >
                      {/* Reference + status */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-primary truncate">
                          <Hash className="h-3 w-3 shrink-0" />
                          {sub.reference_number}
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          {STATUS_ICON[sub.status] ?? <AlertCircle className="h-3.5 w-3.5 text-gray-400" />}
                          <Badge className={`text-[10px] py-0 px-1.5 ${STATUS_STYLES[sub.status] ?? ""}`}>
                            {sub.status}
                          </Badge>
                        </span>
                      </div>

                      {/* Submitter */}
                      {sub.submitted_name && (
                        <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                          <User className="h-3 w-3 shrink-0" /> {sub.submitted_name}
                        </p>
                      )}

                      {/* Research title from form_data */}
                      {sub.form_data?.researchTitle && (
                        <p className="text-[11px] font-medium text-foreground/80 truncate mt-0.5">
                          {sub.form_data.researchTitle}
                        </p>
                      )}

                      {/* Date */}
                      <p className="text-[10px] text-muted-foreground/70 mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(sub.submission_timestamp ?? sub.created_at).toLocaleDateString("en-US",{
                          month:"short", day:"numeric", year:"numeric",
                        })}
                      </p>

                      {/* Assigned to */}
                      {sub.reviewed_by_user && (
                        <p className="text-[10px] text-blue-600 mt-1 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Assigned: {sub.reviewed_by?.name}
                        </p>
                      )}

                      {/* Review notes */}
                      {sub.review_notes && (
                        <p className="mt-1.5 text-[11px] text-muted-foreground bg-muted rounded px-2 py-1 line-clamp-2">
                          💬 {sub.review_notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Research Idea</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">"{deleteTarget?.title}"</span>?{" "}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteIdea.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              id="confirm-delete-btn"
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteIdea.isPending}
              onClick={() => deleteTarget && deleteIdea.mutate(deleteTarget.id)}
            >
              {deleteIdea.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Dialog */}
      <Dialog open={!!assignTarget} onOpenChange={(o) => !o && setAssignTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> Assign to User
            </DialogTitle>
            <DialogDescription>
              Assign <span className="font-mono font-bold text-foreground">{assignTarget?.title}</span> to a staff member
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-semibold block mb-1.5">
                Assign To <span className="text-red-500">*</span>
              </label>
              <Select value={assignUserId} onValueChange={setAssignUserId}>
                <SelectTrigger className="h-10">
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
                placeholder="Assignment instructions or context…"
                rows={3}
                value={assignNote}
                onChange={(e) => setAssignNote(e.target.value)}
                className="resize-none text-sm"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <Button
                className="flex-1 bg-gradient-primary text-primary-foreground"
                disabled={!assignUserId || assignMutation.isPending}
                onClick={() => assignTarget && assignMutation.mutate({ id: assignTarget.id, userId: assignUserId, note: assignNote })}
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
                variant="outline"
                onClick={() => setAssignTarget(null)}
                disabled={assignMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={!!statusTarget} onOpenChange={(o) => !o && setStatusTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" /> Update Status
            </DialogTitle>
            <DialogDescription>
              Change status of <span className="font-mono font-bold text-foreground">{statusTarget?.title}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-semibold block mb-1.5">
                New Status <span className="text-red-500">*</span>
              </label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { v: "draft", l: "Draft" },
                    { v: "submitted", l: "Submitted" },
                    { v: "under_review", l: "Under Review" },
                    { v: "approved", l: "Approved" },
                    { v: "rejected", l: "Rejected" },
                  ].map(({ v, l }) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5">Notes</label>
              <Textarea
                placeholder="Add notes about this status change…"
                rows={4}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="resize-none text-sm"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <Button
                className="flex-1 bg-gradient-primary text-primary-foreground"
                disabled={!newStatus || statusMutation.isPending}
                onClick={() => statusTarget && statusMutation.mutate({ id: statusTarget.id, status: newStatus, notes: statusNote })}
              >
                {statusMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setStatusTarget(null)}
                disabled={statusMutation.isPending}
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
