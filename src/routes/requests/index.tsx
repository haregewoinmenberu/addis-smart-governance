import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, Filter, Eye, Edit, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Can } from "@/components/rbac/Can";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/requests/")({
  component: RequestsPage,
});

interface Request {
  id: number;
  code: string;
  title: string;
  office: string;
  category: string;
  status: string;
  approval_status: string;
  priority: string;
  budget: number;
  submitted_at: string;
  step: number;
  total_steps: number;
}

function RequestsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch requests
  const { data, isLoading } = useQuery({
    queryKey: ["requests", search, statusFilter, priorityFilter, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("approval_status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      params.append("page", currentPage.toString());

      const response = await apiGet<{
        data: Request[];
        current_page: number;
        last_page: number;
      }>(`/requests?${params.toString()}`);
      return response;
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiPost(`/requests/${id}`, { _method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Request deleted successfully");
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete request");
    },
  });

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

  const columns = [
    {
      header: "Code",
      cell: (item: Request) => (
        <div className="font-medium">{item.code}</div>
      ),
    },
    {
      header: "Title",
      cell: (item: Request) => (
        <div>
          <div className="font-medium">{item.title}</div>
          <div className="text-sm text-gray-500">{item.office}</div>
        </div>
      ),
    },
    {
      header: "Category",
      accessorKey: "category" as keyof Request,
    },
    {
      header: "Priority",
      cell: (item: Request) => (
        <Badge className={getPriorityBadge(item.priority)}>{item.priority}</Badge>
      ),
    },
    {
      header: "Status",
      cell: (item: Request) => (
        <Badge className={getStatusBadge(item.approval_status)}>
          {item.approval_status.replace(/_/g, " ").toUpperCase()}
        </Badge>
      ),
    },
    {
      header: "Progress",
      cell: (item: Request) => (
        <div className="text-sm">
          {item.step}/{item.total_steps}
        </div>
      ),
    },
    {
      header: "Budget",
      cell: (item: Request) => (
        <div className="font-medium">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "ETB",
            minimumFractionDigits: 0,
          }).format(item.budget)}
        </div>
      ),
    },
    {
      header: "Actions",
      cell: (item: Request) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate({ to: `/requests/${item.id}` })}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Can permission="edit_requests">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate({ to: `/requests/${item.id}/edit` })}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </Can>
          <Can permission="delete_requests">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleteId(item.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Technology Requests</h1>
          <p className="text-gray-600 mt-1">Manage technology procurement requests</p>
        </div>
        <Can permission="create_requests">
          <Button onClick={() => navigate({ to: "/requests/create" })}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </Can>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search requests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priorities</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setPriorityFilter("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={data?.data || []}
            columns={columns}
            isLoading={isLoading}
            pagination={
              data
                ? {
                    currentPage: data.current_page,
                    totalPages: data.last_page,
                    onPageChange: setCurrentPage,
                  }
                : undefined
            }
            emptyMessage="No requests found"
          />
        </CardContent>
      </Card>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Request"
        description="Are you sure you want to delete this request? This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
