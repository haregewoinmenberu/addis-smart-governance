import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getAuthToken } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { 
  ArrowLeft, Edit, CheckCircle, XCircle, Clock, Trash2, ClipboardCheck, 
  User, Loader2, FileText, Eye, Calendar, Building2, Target, AlertCircle 
} from "lucide-react";
import { researchCategoryLabels, priorityLabels } from "@/lib/research-schema";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/research/ideas/$id/director")({
  component: () => (
    <RequireAuth>
      <ResearchIdeaDirectorDetailPage />
    </RequireAuth>
  ),
});

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-500/10 text-gray-600 border-gray-400/30",
  submitted: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  under_review: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-700 border-green-500/20",
  rejected: "bg-red-500/10 text-red-700 border-red-500/20",
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-slate-100 text-slate-600 border-slate-200",
  medium: "bg-blue-100 text-blue-600 border-blue-200",
  high: "bg-orange-100 text-orange-600 border-orange-200",
  critical: "bg-red-100 text-red-600 border-red-200",
};

function ResearchIdeaDirectorDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");

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
      queryClient.invalidateQueries({ queryKey: ["research-ideas"] });
      setStatusDialogOpen(false);
      setNewStatus("");
      setStatusNote("");
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteAttachment = useMutation({
    mutationFn: async (attachmentId: number) => {
      const res = await fetch(`/api/research-ideas/${id}/attachments/${attachmentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Attachment deleted." });
      queryClient.invalidateQueries({ queryKey: ["research-idea", id] });
    },
    onError: () => toast({ title: "Error", description: "Could not delete.", variant: "destructive" }),
  });

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
        returnTo: `/research/ideas/${id}/director`,
      },
    });
  };

  const getStatusColor = (status: string) => STATUS_STYLES[status] || "";
  const getPriorityColor = (priority: string) => PRIORITY_STYLES[priority] || "";

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!idea?.data) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-lg font-medium">Research idea not found</p>
          <Button className="mt-4" onClick={() => navigate({ to: "/research/ideas/director" })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Research Ideas
          </Button>
        </div>
      </AppShell>
    );
  }

  const ideaData = idea.data;
  const isAssignedToMe = 
    (typeof ideaData.assigned_to_director === 'object' 
      ? ideaData.assigned_to_director?.id 
      : ideaData.assigned_to_director) === user?.id;

  return (
    <AppShell>
      <PageHeader
        title="Research Idea Details"
        subtitle={ideaData.title}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/research/ideas/director", search: { tab: "assigned" } })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Ideas
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-4 border-b">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{ideaData.title}</CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-xs ${getStatusColor(ideaData.status)}`}>
                      {ideaData.status?.replace(/_/g, " ")}
                    </Badge>
                    <Badge className={`text-xs ${getPriorityColor(ideaData.priority)}`}>
                      {priorityLabels[ideaData.priority as keyof typeof priorityLabels] || ideaData.priority}
                    </Badge>
                    {ideaData.research_category && (
                      <Badge variant="outline" className="text-xs">
                        {researchCategoryLabels[ideaData.research_category as keyof typeof researchCategoryLabels]}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Summary</h3>
                <p className="text-sm">{ideaData.summary}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Problem Statement</h3>
                <p className="text-sm">{ideaData.problem_statement}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Objectives</h3>
                <p className="text-sm">{ideaData.objectives}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Expected Outcome</h3>
                <p className="text-sm">{ideaData.expected_outcome}</p>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          {ideaData.attachments && ideaData.attachments.length > 0 && (
            <Card>
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Attachments
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {ideaData.attachments.map((attachment: any) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{attachment.file_name}</p>
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
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Director Notes */}
          {ideaData.director_notes && (
            <Card className="border-blue-200 bg-blue-50/60">
              <CardHeader className="pb-4 border-b border-blue-200">
                <CardTitle className="text-sm font-semibold text-blue-900">Director Notes</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm whitespace-pre-wrap">{ideaData.director_notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-sm font-semibold">Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {isAssignedToMe && (
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => {
                    setStatusDialogOpen(true);
                    setNewStatus(ideaData.status);
                    setStatusNote("");
                  }}
                >
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Update Status
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-sm font-semibold">Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Submitted By</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{ideaData.submitter?.name || "Unknown"}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Submitted Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(ideaData.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              {ideaData.government_sector && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Government Sector</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{ideaData.government_sector}</span>
                  </div>
                </div>
              )}
              {isAssignedToMe && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Assignment Status</p>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-600">Assigned to you</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" /> Update Status
            </DialogTitle>
            <DialogDescription>Change the status of this research idea</DialogDescription>
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5">
                Notes <span className="text-xs font-normal text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                placeholder="Add notes about this status change…"
                rows={3}
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
                    Updating…
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Update Status
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
