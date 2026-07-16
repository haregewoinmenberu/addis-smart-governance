import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getAuthToken } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ArrowLeft, Edit, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import { researchCategoryLabels, priorityLabels } from "@/lib/research-schema";

export const Route = createFileRoute("/research/ideas/$id")({
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
                  onClick={() => navigate({ to: `/research/ideas/${id}/edit` })}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
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
            </div>
          </CardContent>
        </Card>

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
    </AppShell>
  );
}
