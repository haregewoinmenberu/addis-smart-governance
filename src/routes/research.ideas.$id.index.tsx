import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getAuthToken } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ArrowLeft, Edit, CheckCircle, XCircle, Clock, Trash2, UserPlus, ClipboardCheck, User, Loader2, FileText, Upload, Download, Eye } from "lucide-react";
import { researchCategoryLabels, priorityLabels } from "@/lib/research-schema";

export const Route = createFileRoute("/research/ideas/$id/")({
  component: () => (
    <RequireAuth>
      <ResearchIdeaDetailPage />
    </RequireAuth>
  ),
});

function ResearchIdeaDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState("");
  const [assignNote, setAssignNote] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);

  const { data: idea, isLoading } = useQuery({
    queryKey: ["research-idea", id],
    queryFn: async () => {
      const response = await fetch(`/api/research-ideas/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!response.ok) throw new Error("Failed to fetch idea");
      return response.json();
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

  const assignableUsers: any[] = assignableUsersData?.data ?? [];
  const hasHierarchyAccess = assignableUsers.length > 0;
  const isAssignedToIdea = idea?.data?.assigned_to_director;
  const canUpdateStatus = hasHierarchyAccess || isAssignedToIdea;
  const canReassign = hasHierarchyAccess;

  const assignMutation = useMutation({
    mutationFn: async ({ userId, note }: { userId: string; note: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ["research-idea", id] });
      setAssignDialogOpen(false);
      setAssignUserId("");
      setAssignNote("");
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: string; notes: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ["research-idea", id] });
      setStatusDialogOpen(false);
      setNewStatus("");
      setStatusNote("");
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteIdea = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/research-ideas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!response.ok) throw new Error("Failed to delete idea");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Research idea deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["research-ideas"] });
      navigate({ to: "/research/ideas" });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not delete the idea.", variant: "destructive" });
    },
  });

  const uploadAttachment = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/research-ideas/${id}/attachments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload file");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "✅ Uploaded", description: "File uploaded successfully." });
      queryClient.invalidateQueries({ queryKey: ["research-idea", id] });
      setUploadingFile(false);
    },
    onError: (e: Error) => {
      toast({ title: "Upload Failed", description: e.message, variant: "destructive" });
      setUploadingFile(false);
    },
  });

  const deleteAttachment = useMutation({
    mutationFn: async (attachmentId: number) => {
      const res = await fetch(`/api/research-ideas/${id}/attachments/${attachmentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to delete attachment");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Attachment deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["research-idea", id] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingFile(true);
      uploadAttachment.mutate(file);
    }
  };

  const viewFile = (attachmentId: number, fileName: string, fileType: string) => {
    // Always navigate to the documents viewer (it will handle PDFs, images, and other files)
    navigate({
      to: "/documents/$id",
      params: { id: String(id) },
      search: {
        type: "research-idea",
        attachmentId: String(attachmentId),
        name: fileName,
        fileType: fileType,
        returnTo: `/research/ideas/${id}`,
      },
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-500/10 text-gray-700 border-gray-500/20",
      submitted: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      under_review: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      approved: "bg-green-500/10 text-green-700 border-green-500/20",
      rejected: "bg-red-500/10 text-red-700 border-red-500/20",
    };
    return colors[status] || "bg-gray-500/10 text-gray-700";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-gray-400/10 text-gray-600 border-gray-400/20",
      medium: "bg-blue-400/10 text-blue-600 border-blue-400/20",
      high: "bg-orange-400/10 text-orange-600 border-orange-400/20",
      critical: "bg-red-500/10 text-red-600 border-red-500/20",
    };
    return colors[priority] || "bg-gray-400/10 text-gray-600";
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="text-center py-12 text-muted-foreground">Loading idea details...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={idea?.data?.title || "Research Idea Details"}
        subtitle="View research idea information and status"
        actions={
          <div className="flex gap-2">
            {idea?.data?.status === 'draft' && (
              <>
                <Button
                  id={`edit-idea-${id}-btn`}
                  size="sm"
                  className="bg-gradient-primary text-primary-foreground shadow-glow"
                  onClick={() => navigate({ to: `/research/ideas/${id}/workspace` })}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Open Workspace
                </Button>
                <Button
                  id={`delete-idea-${id}-btn`}
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/research/ideas' })}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Ideas
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Status Overview */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Status Overview</CardTitle>
                <CardDescription>Current state and metadata</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(idea?.data?.status)}>
                  {idea?.data?.status?.replace('_', ' ')}
                </Badge>
                <Badge className={getPriorityColor(idea?.data?.priority)}>
                  {idea?.data?.priority}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Submitted By</p>
                <p className="font-medium">{idea?.data?.submitter?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submission Date</p>
                <p className="font-medium">{new Date(idea?.data?.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{researchCategoryLabels[idea?.data?.research_category as keyof typeof researchCategoryLabels]}</p>
              </div>
              {idea?.data?.assigned_to_director && (
                <div>
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  <p className="font-medium text-blue-700 flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {idea?.data?.assigned_director_name || `User #${idea?.data?.assigned_to_director}`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions Card - Only for users with permissions */}
        {(canReassign || canUpdateStatus) && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              {canReassign && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setAssignUserId(String(idea?.data?.assigned_to_director ?? ""));
                    setAssignNote("");
                    setAssignDialogOpen(true);
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign to User
                </Button>
              )}
              {canUpdateStatus && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewStatus(idea?.data?.status ?? "");
                    setStatusNote("");
                    setStatusDialogOpen(true);
                  }}
                >
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Update Status
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Core details of the research idea</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Research Title</p>
              <p className="font-medium text-lg">{idea?.data?.title}</p>
            </div>

            {idea?.data?.government_sector && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Government Sector</p>
                <Badge variant="outline">{idea?.data?.government_sector}</Badge>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-1">Executive Summary</p>
              <p className="text-sm leading-relaxed">{idea?.data?.summary}</p>
            </div>
          </CardContent>
        </Card>

        {/* Problem & Objectives */}
        <Card>
          <CardHeader>
            <CardTitle>Problem & Objectives</CardTitle>
            <CardDescription>Research problem and intended outcomes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Problem Statement</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{idea?.data?.problem_statement}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Research Objectives</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{idea?.data?.objectives}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Expected Outcome</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{idea?.data?.expected_outcome}</p>
            </div>
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Supporting Documents
                </CardTitle>
                <CardDescription>
                  Uploaded files and attachments
                </CardDescription>
              </div>
              <div>
                <input
                  type="file"
                  id="file-upload-input"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("file-upload-input")?.click()}
                  disabled={uploadingFile}
                >
                  {uploadingFile ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {idea?.data?.attachments && idea.data.attachments.length > 0 ? (
              <div className="space-y-2">
                {idea.data.attachments.map((attachment: any) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {attachment.file_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(attachment.file_size / 1024).toFixed(0)} KB •{" "}
                        {new Date(attachment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewFile(attachment.id, attachment.file_name, attachment.file_type)}
                        title="View file"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Delete "${attachment.file_name}"?`)) {
                            deleteAttachment.mutate(attachment.id);
                          }
                        }}
                        title="Delete file"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No attachments uploaded yet</p>
                <p className="text-xs mt-1">Click "Upload File" to add supporting documents</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workflow History */}
        {idea?.data?.workflow_history && idea?.data?.workflow_history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Workflow History</CardTitle>
              <CardDescription>Stage transitions and status changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {idea?.data?.workflow_history.map((history: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className="mt-1">
                      {history.to_stage === 'approved' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : history.to_stage === 'rejected' ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {history.from_stage?.replace('_', ' ')} → {history.to_stage?.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {history.transitioned_by?.name} • {new Date(history.transitioned_at).toLocaleString()}
                      </p>
                      {history.comments && (
                        <p className="text-sm mt-1 text-muted-foreground">{history.comments}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Research Idea</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">"{idea?.data?.title}"</span>?{" "}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteIdea.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              id="confirm-delete-idea-detail-btn"
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteIdea.isPending}
              onClick={() => deleteIdea.mutate()}
            >
              {deleteIdea.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> Assign to User
            </DialogTitle>
            <DialogDescription>
              Assign this research idea to a staff member for review
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

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" /> Update Status
            </DialogTitle>
            <DialogDescription>
              Change the status of this research idea
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
                onClick={() => statusMutation.mutate({ status: newStatus, notes: statusNote })}
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
                onClick={() => setStatusDialogOpen(false)}
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
