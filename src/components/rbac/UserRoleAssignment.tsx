import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rolesApi, userRolesApi } from "@/lib/api/rbac";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, X } from "lucide-react";
import type { User, Role } from "@/types/rbac";

interface UserRoleAssignmentProps {
  user: User;
  trigger?: React.ReactNode;
}

export function UserRoleAssignment({ user, trigger }: UserRoleAssignmentProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<number[]>(
    user.roles?.map((r) => r.id) || []
  );

  // Fetch all available roles
  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: () => rolesApi.list(),
  });

  // Assign roles mutation
  const assignMutation = useMutation({
    mutationFn: (roleIds: number[]) => userRolesApi.assign(user.id, roleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", user.id] });
      setIsOpen(false);
      toast.success("User roles updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update roles");
    },
  });

  const handleToggleRole = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSubmit = () => {
    assignMutation.mutate(selectedRoles);
  };

  const roles = rolesData?.data || [];

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <Button onClick={() => setIsOpen(true)} variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Manage Roles
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Roles to {user.name}</DialogTitle>
            <DialogDescription>
              Select the roles you want to assign to this user
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm text-muted-foreground">Current roles:</span>
              {user.roles && user.roles.length > 0 ? (
                user.roles.map((role) => (
                  <Badge key={role.id} variant="secondary">
                    {role.display_name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No roles assigned</span>
              )}
            </div>

            <div className="border rounded-md p-4 space-y-3 max-h-96 overflow-y-auto">
              {roles.map((role) => (
                <div key={role.id} className="flex items-start gap-3">
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={selectedRoles.includes(role.id)}
                    onCheckedChange={() => handleToggleRole(role.id)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`role-${role.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {role.display_name}
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                    {role.permissions && role.permissions.length > 0 && (
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          {role.permissions.length} permissions
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={assignMutation.isPending}
            >
              {assignMutation.isPending ? "Saving..." : "Save Roles"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface QuickRoleBadgesProps {
  user: User;
  editable?: boolean;
}

export function QuickRoleBadges({ user, editable = false }: QuickRoleBadgesProps) {
  const queryClient = useQueryClient();

  const removeMutation = useMutation({
    mutationFn: ({ roleId }: { roleId: number }) =>
      userRolesApi.remove(user.id, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", user.id] });
      toast.success("Role removed successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to remove role");
    },
  });

  const handleRemove = (roleId: number) => {
    if (confirm("Are you sure you want to remove this role from the user?")) {
      removeMutation.mutate({ roleId });
    }
  };

  if (!user.roles || user.roles.length === 0) {
    return <span className="text-sm text-muted-foreground">No roles</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {user.roles.map((role) => (
        <Badge key={role.id} variant="secondary" className="gap-1">
          {role.display_name}
          {editable && (
            <button
              onClick={() => handleRemove(role.id)}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}
    </div>
  );
}
