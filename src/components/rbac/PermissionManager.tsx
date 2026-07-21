import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { permissionsApi } from "@/lib/api/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Shield, Filter } from "lucide-react";
import type { Permission } from "@/types/rbac";

export function PermissionManager() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  // Fetch permissions
  const { data: permissionsData, isLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => permissionsApi.list({ paginate: false }),
  });

  // Fetch modules
  const { data: modules } = useQuery({
    queryKey: ["permissions", "modules"],
    queryFn: permissionsApi.modules,
  });

  // Create permission mutation
  const createMutation = useMutation({
    mutationFn: permissionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      setIsCreateOpen(false);
      toast.success("Permission created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create permission");
    },
  });

  // Update permission mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      permissionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      setIsEditOpen(false);
      setSelectedPermission(null);
      toast.success("Permission updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update permission");
    },
  });

  // Delete permission mutation
  const deleteMutation = useMutation({
    mutationFn: permissionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Permission deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete permission");
    },
  });

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsEditOpen(true);
  };

  const handleDelete = async (permissionId: number) => {
    if (confirm("Are you sure you want to delete this permission?")) {
      deleteMutation.mutate(permissionId);
    }
  };

  const permissions = Array.isArray(permissionsData) ? permissionsData : [];
  const filteredPermissions = permissions.filter((permission) => {
    const matchesSearch =
      permission.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule =
      moduleFilter === "all" || permission.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  // Group permissions by module for display
  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    const module = permission.module || "other";
    if (!acc[module]) acc[module] = [];
    acc[module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Permission Management</h2>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Permission
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search permissions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {modules?.map((module) => (
              <SelectItem key={module} value={module}>
                {module.charAt(0).toUpperCase() + module.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading permissions...</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([module, perms]) => (
            <div key={module} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 capitalize">
                {module} Module
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {perms.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell>
                        <div className="font-medium">{permission.display_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {permission.name}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate">{permission.description}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(permission)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(permission.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      )}

      <CreatePermissionDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={(data) => createMutation.mutate(data)}
        modules={modules || []}
        isLoading={createMutation.isPending}
      />

      {selectedPermission && (
        <EditPermissionDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          permission={selectedPermission}
          onSubmit={(data) =>
            updateMutation.mutate({ id: selectedPermission.id, data })
          }
          modules={modules || []}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}

interface PermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  modules: string[];
  isLoading: boolean;
}

function CreatePermissionDialog({
  open,
  onOpenChange,
  onSubmit,
  modules,
  isLoading,
}: PermissionDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    display_name: "",
    module: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Permission</DialogTitle>
          <DialogDescription>
            Define a new permission for role assignment
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Permission Name (Slug)</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., view_custom_data"
              required
            />
          </div>
          <div>
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) =>
                setFormData({ ...formData, display_name: e.target.value })
              }
              placeholder="e.g., View Custom Data"
              required
            />
          </div>
          <div>
            <Label htmlFor="module">Module</Label>
            <Select
              value={formData.module}
              onValueChange={(value) =>
                setFormData({ ...formData, module: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                {modules.map((module) => (
                  <SelectItem key={module} value={module}>
                    {module.charAt(0).toUpperCase() + module.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe what this permission allows"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Permission"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface EditPermissionDialogProps extends PermissionDialogProps {
  permission: Permission;
}

function EditPermissionDialog({
  open,
  onOpenChange,
  permission,
  onSubmit,
  modules,
  isLoading,
}: EditPermissionDialogProps) {
  const [formData, setFormData] = useState({
    display_name: permission.display_name,
    module: permission.module,
    description: permission.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Permission: {permission.display_name}</DialogTitle>
          <DialogDescription>Update permission details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) =>
                setFormData({ ...formData, display_name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="module">Module</Label>
            <Select
              value={formData.module}
              onValueChange={(value) =>
                setFormData({ ...formData, module: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                {modules.map((module) => (
                  <SelectItem key={module} value={module}>
                    {module.charAt(0).toUpperCase() + module.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Permission"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
