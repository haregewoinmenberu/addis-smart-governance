import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";
import { getRequests, getRequestStatistics, deleteRequest, submitRequest } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { Plus, Filter, Search, FileStack, Clock, CheckCircle2, AlertCircle, Edit, Trash2, MoreVertical, Send } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/requests/")({
  head: () => ({ meta: [{ title: "Technology Requests — STRP" }] }),
  component: () => (
    <RequireAuth>
      <Page />
    </RequireAuth>
  ),
});

type RequestItem = {
  id: number;
  code: string;
  title: string;
  description?: string;
  office: string;
  status: string;
  step: number;
  total_steps: number;
  budget: number | null;
  submitted_at: string;
  justification?: string;
  expected_outcomes?: string;
};

const statusStyle = (s: string) => {
  if (s === "Approved") return "bg-success/10 text-success border-success/20";
  if (s === "Rejected") return "bg-destructive/10 text-destructive border-destructive/20";
  if (s === "In review") return "bg-info/10 text-info border-info/20";
  return "bg-warning/15 text-warning-foreground border-warning/30";
};

function Page() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState(search.q);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    action: "delete" | "submit" | null;
    target: RequestItem | null;
  }>({ isOpen: false, action: null, target: null });

  // Fetch requests
  const { data: requestsData, isLoading } = useQuery({
    queryKey: ["requests", searchQuery],
    queryFn: () => getRequests({ search: searchQuery }),
  });

  // Fetch statistics
  const { data: statsData } = useQuery({
    queryKey: ["request-statistics"],
    queryFn: getRequestStatistics,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["request-statistics"] });
      toast({
        title: "Success",
        description: "Request deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: submitRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["request-statistics"] });
      toast({
        title: "Success",
        description: "Request submitted for approval",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (id: number) => {
    navigate({ to: "/requests/$id/edit", params: { id: id.toString() } });
  };

  const openConfirm = (action: "delete" | "submit", target: RequestItem) => {
    setConfirmState({ isOpen: true, action, target });
  };

  const closeConfirm = () => {
    setConfirmState({ isOpen: false, action: null, target: null });
  };

  const handleConfirm = () => {
    if (!confirmState.target || !confirmState.action) return;
    if (confirmState.action === "delete") {
      deleteMutation.mutate(confirmState.target.id);
    }
    if (confirmState.action === "submit") {
      submitMutation.mutate(confirmState.target.id);
    }
    closeConfirm();
  };

  const confirmTitle =
    confirmState.action === "delete"
      ? "Delete request?"
      : "Submit request?";

  const confirmMessage =
    confirmState.action === "delete"
      ? "This action cannot be undone."
      : "This will submit the request for approval.";

  const requests = requestsData?.data || [];
  const stats = statsData?.data || { total: 0, draft: 0, pending: 0, approved: 0 };
  const pendingCount = stats.pending || 0;
  const approvedCount = stats.approved || 0;
  const actionCount = requests.filter((r: RequestItem) => r.status === "In review").length;

  return (
    <AppShell>
      <PageHeader
        title="Technology Requests"
        subtitle="Submit, track and manage technology procurement and deployment requests across the city."
        actions={
          <PermissionGuard permission="create_requests">
            <Button
              size="sm"
              className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow"
              onClick={() => navigate({ to: "/requests/create" })}
            >
              <Plus className="h-4 w-4" />
              New request
            </Button>
          </PermissionGuard>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { l: "Pending review", v: pendingCount.toString(), i: Clock, c: "bg-warning/15 text-warning-foreground" },
          { l: "Approved this month", v: approvedCount.toString(), i: CheckCircle2, c: "bg-success/10 text-success" },
          { l: "Action required", v: actionCount.toString(), i: AlertCircle, c: "bg-destructive/10 text-destructive" },
        ].map((s) => (
          <Card key={s.l} className="p-5 rounded-2xl border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.l}</p>
                <p className="text-2xl font-semibold mt-1">{s.v}</p>
              </div>
              <s.i className={`h-9 w-9 p-2 rounded-xl ${s.c}`} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-border/60 overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests…"
              className="pl-9 bg-muted/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5"><Filter className="h-4 w-4" />Filters</Button>
            <Button variant="outline" size="sm">All statuses</Button>
          </div>
        </div>

        <div className="border border-border/40 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f8fafc] border-b border-border/40 text-[11px] uppercase tracking-wider font-semibold text-[#718096]">
                <tr>
                  <th className="text-left py-3.5 px-6 font-semibold">Request</th>
                  <th className="text-left py-3.5 px-6 font-semibold">Office</th>
                  <th className="text-left py-3.5 px-6 font-semibold">Status</th>
                  <th className="text-left py-3.5 px-6 font-semibold">Stage</th>
                  <th className="text-left py-3.5 px-6 font-semibold">Budget</th>
                  <th className="text-left py-3.5 px-6 font-semibold">Submitted</th>
                  <th className="text-right py-3.5 px-6 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      Loading requests...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((r: RequestItem, rowIndex: number) => (
                    <tr key={r.id} className={`border-b border-border/40 hover:bg-slate-50/50 transition-colors ${
                      rowIndex % 2 === 0 ? "bg-white" : "bg-[#f8fafc]/30"
                    }`}>
                      <td className="px-6 py-4 text-sm text-[#4a5568]">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <FileStack className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-[#1a202c]">{r.title}</p>
                            <p className="text-xs text-muted-foreground">{r.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#4a5568]">{r.office}</td>
                      <td className="px-6 py-4 text-sm text-[#4a5568]"><Badge variant="secondary" className={statusStyle(r.status)}>{r.status}</Badge></td>
                      <td className="px-6 py-4 text-sm text-[#4a5568]">
                        <div className="flex items-center gap-2">
                          <Progress value={(r.step / r.total_steps) * 100} className="h-1.5 w-24 rounded-full bg-muted" />
                          <span className="text-xs text-muted-foreground">{r.step}/{r.total_steps}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#1a202c]">{formatCurrency(r.budget ?? 0)}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(r.submitted_at)}</td>
                      <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <PermissionGuard permission="edit_requests">
                            <DropdownMenuItem onClick={() => handleEdit(r.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </PermissionGuard>
                          <PermissionGuard permission="submit_requests">
                            {r.status === "Draft" && (
                              <DropdownMenuItem onClick={() => openConfirm("submit", r)}>
                                <Send className="h-4 w-4 mr-2" />
                                Submit
                              </DropdownMenuItem>
                            )}
                          </PermissionGuard>
                          <PermissionGuard permission="delete_requests">
                            <DropdownMenuItem
                              onClick={() => openConfirm("delete", r)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </PermissionGuard>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
      <AlertDialog open={confirmState.isOpen} onOpenChange={(open) => { if (!open) closeConfirm(); }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{confirmMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeConfirm}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              className={confirmState.action === "delete" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
