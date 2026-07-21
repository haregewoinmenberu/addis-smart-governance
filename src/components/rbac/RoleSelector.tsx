import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { rolesApi } from "@/lib/api/rbac";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { Role } from "@/types/rbac";

interface RoleSelectorProps {
  value?: number[];
  onChange?: (roleIds: number[]) => void;
  multiple?: boolean;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export function RoleSelector({
  value = [],
  onChange,
  multiple = true,
  label = "Select Role",
  placeholder = "Choose role(s)",
  disabled = false,
  required = false,
}: RoleSelectorProps) {
  const [selectedRoles, setSelectedRoles] = useState<number[]>(value);

  const { data: rolesData, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => rolesApi.list(),
  });

  const roles = rolesData?.data || [];

  const handleRoleToggle = (roleId: number) => {
    let newSelection: number[];
    
    if (multiple) {
      newSelection = selectedRoles.includes(roleId)
        ? selectedRoles.filter((id) => id !== roleId)
        : [...selectedRoles, roleId];
    } else {
      newSelection = [roleId];
    }

    setSelectedRoles(newSelection);
    onChange?.(newSelection);
  };

  const selectedRoleObjects = roles.filter((role) =>
    selectedRoles.includes(role.id)
  );

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading roles...</div>;
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label} {required && <span className="text-red-500">*</span>}</Label>}
      
      <Select
        disabled={disabled}
        onValueChange={(value) => handleRoleToggle(parseInt(value))}
      >
        <SelectTrigger>
          <SelectValue>
            {selectedRoleObjects.length > 0 ? (
              <div className="flex gap-1 flex-wrap">
                {selectedRoleObjects.map((role) => (
                  <Badge key={role.id} variant="secondary" className="text-xs">
                    {role.display_name}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id.toString()}>
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="font-medium">{role.display_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {role.description}
                  </div>
                </div>
                {selectedRoles.includes(role.id) && (
                  <Badge variant="outline" className="ml-2">
                    Selected
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedRoleObjects.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {selectedRoleObjects.length} role(s) selected
        </div>
      )}
    </div>
  );
}
