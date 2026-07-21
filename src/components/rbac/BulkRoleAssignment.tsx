import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { rolesApi } from "@/lib/api/rbac";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users } from "lucide-react";
import type { User } from "@/types/rbac";

interface BulkRoleAssignmentProps {
  selectedUsers: User[];
  onClose: () => void;
}

export function BulkRoleAssignment({ selectedUsers, onClose }: BulkRoleAssignmentProps) {
  const queryClient = useQueryClient();
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: () => rolesApi.list(),
  });

  const assignMutation = useMutation({
    mutationFn: async (data: { user_ids: number[]; role_ids: number[] }) => {
      const response = await apiClient.post("/rbac/bulk/assign-roles", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Roles assigned successfully");
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to assign roles");
    },
  });

  const handleToggleRole = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSubmit = () => {
    if (selectedRoles.length === 0) {
      toast.error("Please select at least one role");
      return;
    }

    assignMutation.mutate({
      user_ids: selectedUsers.map((u) => u.id),
      role_ids: selectedRoles,
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const roles = rolesData?.data || [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Role Assignment
          </DialogTitle>
          <DialogDescription>
            Assign roles to {selectedUsers.length} selected user(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Selected Users:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <Badge key={user.id} variant="secondary">
                  {user.name}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Select Roles to Assign:</h4>
            <div className="border rounded-md p-4 space-y-3 max-h-96 overflow-y-auto">
              {roles.map((role) => (
                <div key={role.id} className="flex items-start gap-3">
                  <Checkbox
                    id={`bulk-role-${role.id}`}
                    checked={selectedRoles.includes(role.id)}
                    onCheckedChange={() => handleToggleRole(role.id)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`bulk-role-${role.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {role.display_name}
                    </label>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={assignMutation.isPending}>
            {assignMutation.isPending ? "Assigning..." : "Assign Roles"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
