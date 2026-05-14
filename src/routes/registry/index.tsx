import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Can } from "@/components/rbac/Can";
import { getTechnologies, deleteTechnology } from "@/lib/api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/registry/")({
  component: TechnologyRegistryPage,
});

interface Technology {
  id: number;
  name: string;
  category: string;
  owner_office: string;
  status: string;
  classification: string;
  location: string;
  deployed_at: string;
}

function TechnologyRegistryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch technologies
  const { data, isLoading } = useQuery({
    queryKey: ["technologies", search, categoryFilter, statusFilter, classificationFilter, currentPage],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (classificationFilter) params.classification = classificationFilter;
      params.page = currentPage.toString();

      return await getTechnologies(params);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await deleteTechnology(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technologies"] });
      toast.success("Technology deleted successfully");
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete technology");
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Active: "bg-green-100 text-green-800",
      Inactive: "bg-gray-100 text-gray-800",
      "In review": "bg-yellow-100 text-yellow-800",
      Paused: "bg-orange-100 text-orange-800",
      Pending: "bg-blue-100 text-blue-800",
    };
    return variants[status] || "bg-gray-100 text-gray-800";
  };

  const getClassificationBadge = (classification: string) => {
    const variants: Record<string, string> = {
      "Tier-1": "bg-purple-100 text-purple-800",
      "Tier-2": "bg-blue-100 text-blue-800",
      "Tier-3": "bg-gray-100 text-gray-800",
    };
    return variants[classification] || "bg-gray-100 text-gray-800";
  };

  const columns = [
    {
      header: "Name",
      cell: (item: Technology) => (
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-sm text-gray-500">{item.category}</div>
        </div>
      ),
    },
    {
      header: "Owner Office",
      accessorKey: "owner_office" as keyof Technology,
    },
    {
      header: "Classification",
      cell: (item: Technology) => (
        <Badge className={getClassificationBadge(item.classification)}>
          {item.classification}
        </Badge>
      ),
    },
    {
      header: "Status",
      cell: (item: Technology) => (
        <Badge className={getStatusBadge(item.status)}>{item.status}</Badge>
      ),
    },
    {
      header: "Location",
      accessorKey: "location" as keyof Technology,
    },
    {
      header: "Deployed",
      cell: (item: Technology) => (
        <div className="text-sm">
          {item.deployed_at ? new Date(item.deployed_at).toLocaleDateString() : "N/A"}
        </div>
      ),
    },
    {
      header: "Actions",
      cell: (item: Technology) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate({ to: `/registry/${item.id}` })}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Can permission="edit_technologies">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate({ to: `/registry/${item.id}/edit` })}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </Can>
          <Can permission="delete_technologies">
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
          <h1 className="text-3xl font-bold">Technology Registry</h1>
          <p className="text-gray-600 mt-1">Manage deployed technologies across sub-cities</p>
        </div>
        <Can permission="create_technologies">
          <Button onClick={() => navigate({ to: "/registry/create" })}>
            <Plus className="h-4 w-4 mr-2" />
            Add Technology
          </Button>
        </Can>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search technologies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="Transport">Transport</SelectItem>
                <SelectItem value="Citizen Services">Citizen Services</SelectItem>
                <SelectItem value="Permitting">Permitting</SelectItem>
                <SelectItem value="Assets">Assets</SelectItem>
                <SelectItem value="Sanitation">Sanitation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="In review">In Review</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={classificationFilter} onValueChange={setClassificationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Classifications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Classifications</SelectItem>
                <SelectItem value="Tier-1">Tier-1</SelectItem>
                <SelectItem value="Tier-2">Tier-2</SelectItem>
                <SelectItem value="Tier-3">Tier-3</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setCategoryFilter("");
                setStatusFilter("");
                setClassificationFilter("");
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
            emptyMessage="No technologies found"
          />
        </CardContent>
      </Card>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Technology"
        description="Are you sure you want to delete this technology? This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
