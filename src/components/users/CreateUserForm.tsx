import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CreateUserData } from "@/lib/api/users";
import { useHierarchy } from "@/hooks/useHierarchy";
import { AlertCircle, Users, Shield, Building2 } from "lucide-react";

interface CreateUserFormProps {
  onSubmit: (data: CreateUserData) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function CreateUserForm({ onSubmit, isLoading, onCancel }: CreateUserFormProps) {
  const { 
    manageableRoles, 
    hierarchyInfo, 
    hasManagementCapability,
    getRolesByLevel 
  } = useHierarchy();

  const [formData, setFormData] = useState<CreateUserData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    position: "",
    department: hierarchyInfo?.user?.department || "",
    user_type: "INTERNAL",
    roles: [],
    is_active: true,
  });

  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showRoleGroups, setShowRoleGroups] = useState(false);

  // Update department when hierarchy info loads
  useEffect(() => {
    if (hierarchyInfo?.user?.department && !formData.department) {
      setFormData(prev => ({
        ...prev,
        department: hierarchyInfo.user.department,
      }));
    }
  }, [hierarchyInfo, formData.department]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== passwordConfirmation) {
      alert("Passwords do not match");
      return;
    }

    if (formData.roles.length === 0) {
      alert("Please select at least one role");
      return;
    }
    
    onSubmit(formData);
  };

  const handleRoleToggle = (roleName: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleName)
        ? prev.roles.filter((r) => r !== roleName)
        : [...prev.roles, roleName],
    }));
  };

  const rolesByLevel = getRolesByLevel();
  const hasMultipleLevels = Object.values(rolesByLevel).filter(roles => roles.length > 0).length > 1;

  if (!hasManagementCapability) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You do not have permission to create users. You can only create users in roles that are directly below your position in the organizational hierarchy.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hierarchy Context Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Your Management Scope
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <span className="font-medium">Department:</span>
              <span className="text-muted-foreground ml-2">
                {hierarchyInfo?.user?.department || "Not assigned"}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <span className="font-medium">Can create roles:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {manageableRoles.slice(0, 3).map((role) => (
                  <Badge key={role.id} variant="secondary" className="text-xs">
                    {role.display_name}
                  </Badge>
                ))}
                {manageableRoles.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{manageableRoles.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the new user's personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.doe@itdb.gov.et"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+251911000000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position/Title</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Senior Officer"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organizational Details */}
        <Card>
          <CardHeader>
            <CardTitle>Organizational Details</CardTitle>
            <CardDescription>Assign department and user type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>User Type Guide:</strong>
                <ul className="mt-1 ml-4 list-disc space-y-1">
                  <li><strong>Internal Staff:</strong> Bureau employees (Sector Heads, Directors, Officers, etc.)</li>
                  <li><strong>Institutional:</strong> Users from other government institutions</li>
                  <li><strong>External:</strong> Consultants or external partners</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder={hierarchyInfo?.user?.department || "Enter department"}
              />
              <p className="text-xs text-muted-foreground">
                User will be created in your department by default
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_type">
                User Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.user_type}
                onValueChange={(value: any) => {
                  setFormData({ 
                    ...formData, 
                    user_type: value,
                    // Clear institution_id if not INSTITUTIONAL
                    institution_id: value === 'INSTITUTIONAL' ? formData.institution_id : undefined
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTERNAL">Internal Staff</SelectItem>
                  <SelectItem value="INSTITUTIONAL">Institutional</SelectItem>
                  <SelectItem value="EXTERNAL">External Consultant</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Internal Staff: Bureau employees. Institutional: Other government institutions. External: Consultants.
              </p>
            </div>

            {formData.user_type === 'INSTITUTIONAL' && (
              <div className="space-y-2">
                <Label htmlFor="institution_id">
                  Institution <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="institution_id"
                  type="number"
                  value={formData.institution_id || ''}
                  onChange={(e) => setFormData({ ...formData, institution_id: parseInt(e.target.value) })}
                  placeholder="Institution ID"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Required for institutional users
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role Assignment */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Role Assignment</CardTitle>
                <CardDescription>
                  Select roles (one level below your position)
                </CardDescription>
              </div>
              {hasMultipleLevels && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRoleGroups(!showRoleGroups)}
                >
                  {showRoleGroups ? "Show All" : "Group by Level"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  You can only assign roles that are directly below your position in the hierarchy.
                  {manageableRoles.length === 1 && (
                    <span className="block mt-1 font-medium">
                      Available role: {manageableRoles[0].display_name}
                    </span>
                  )}
                </AlertDescription>
              </Alert>

              {showRoleGroups && hasMultipleLevels ? (
                // Grouped by hierarchy level
                <div className="space-y-4">
                  {Object.entries(rolesByLevel).map(([level, roles]) => {
                    if (roles.length === 0) return null;
                    const levelNames = {
                      '1': 'Bureau Level',
                      '2': 'Sector/Director Level',
                      '3': 'Team Leader/Manager Level',
                      '4': 'Officer/Engineer/Developer Level',
                    };
                    return (
                      <div key={level} className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground">
                          {levelNames[level as keyof typeof levelNames]}
                        </h4>
                        <div className="border rounded-md p-4 space-y-3 bg-muted/30">
                          {roles.map((role) => (
                            <div key={role.id} className="flex items-start gap-3">
                              <Checkbox
                                id={`role-${role.id}`}
                                checked={formData.roles.includes(role.name)}
                                onCheckedChange={() => handleRoleToggle(role.name)}
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor={`role-${role.id}`}
                                  className="text-sm font-medium cursor-pointer leading-tight"
                                >
                                  {role.display_name}
                                </label>
                                {role.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {role.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Flat list
                <div className="border rounded-md p-4 space-y-3 max-h-96 overflow-y-auto bg-muted/30">
                  {manageableRoles.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No manageable roles available
                    </p>
                  ) : (
                    manageableRoles.map((role) => (
                      <div key={role.id} className="flex items-start gap-3">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={formData.roles.includes(role.name)}
                          onCheckedChange={() => handleRoleToggle(role.name)}
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={`role-${role.id}`}
                            className="text-sm font-medium cursor-pointer leading-tight"
                          >
                            {role.display_name}
                          </label>
                          {role.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {role.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {formData.roles.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Selected:</span>
                  <div className="flex flex-wrap gap-1">
                    {formData.roles.map((roleName) => {
                      const role = manageableRoles.find(r => r.name === roleName);
                      return (
                        <Badge key={roleName} variant="default">
                          {role?.display_name || roleName}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Set initial password (user can change later)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">
                  Confirm Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isLoading || formData.roles.length === 0}
            className="min-w-32"
          >
            {isLoading ? "Creating..." : "Create User"}
          </Button>
        </div>
      </form>
    </div>
  );
}
