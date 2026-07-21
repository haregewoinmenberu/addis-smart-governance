import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPermissionName } from "@/lib/rbac";
import { permissionDescriptions } from "@/config/navigation";
import type { PermissionName } from "@/types/rbac";
import { Search, Shield, CheckCircle2, Filter, Grid, List } from "lucide-react";

type ViewMode = "grid" | "list";
type FilterCategory = "all" | "view" | "create" | "edit" | "delete" | "manage" | "approve";

export function PermissionManagementPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const permissions = user?.permissions || [];

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = getPermissionCategory(permission);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, PermissionName[]>);

  // Filter permissions based on search and category
  const filteredPermissions = permissions.filter((permission) => {
    const matchesSearch = 
      permission.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatPermissionName(permission).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      filterCategory === "all" || 
      permission.includes(filterCategory);

    return matchesSearch && matchesCategory;
  });

  const categories = Object.keys(groupedPermissions).sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Permission Management
        </h1>
        <p className="text-muted-foreground mt-1">
          You have {permissions.length} permissions across {categories.length} categories
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{permissions.length}</div>
            <p className="text-xs text-muted-foreground">Total Permissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {permissions.filter(p => p.includes("view")).length}
            </div>
            <p className="text-xs text-muted-foreground">View Permissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {permissions.filter(p => p.includes("create") || p.includes("edit")).length}
            </div>
            <p className="text-xs text-muted-foreground">Modify Permissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {permissions.filter(p => p.includes("approve") || p.includes("manage")).length}
            </div>
            <p className="text-xs text-muted-foreground">Admin Permissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find specific permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search permissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory("all")}
            >
              All
            </Button>
            <Button
              variant={filterCategory === "view" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory("view")}
            >
              View
            </Button>
            <Button
              variant={filterCategory === "create" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory("create")}
            >
              Create
            </Button>
            <Button
              variant={filterCategory === "edit" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory("edit")}
            >
              Edit
            </Button>
            <Button
              variant={filterCategory === "approve" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory("approve")}
            >
              Approve
            </Button>
            <Button
              variant={filterCategory === "manage" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory("manage")}
            >
              Manage
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredPermissions.length} of {permissions.length} permissions
          </div>
        </CardContent>
      </Card>

      {/* Permissions Display */}
      <Tabs defaultValue={categories[0]} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category} ({groupedPermissions[category].length})
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{category} Permissions</CardTitle>
                <CardDescription>
                  Permissions related to {category} operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {viewMode === "grid" ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {groupedPermissions[category].map((permission) => (
                      <div
                        key={permission}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{formatPermissionName(permission)}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {permissionDescriptions[permission] || "No description available"}
                          </p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {permission}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {groupedPermissions[category].map((permission) => (
                      <div
                        key={permission}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                          <div>
                            <p className="font-medium">{formatPermissionName(permission)}</p>
                            <p className="text-sm text-muted-foreground">
                              {permissionDescriptions[permission] || "No description available"}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{permission}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function getPermissionCategory(permission: PermissionName): string {
  // Extract the resource/category from the permission name
  const parts = permission.split("_");
  
  // For permissions like "view_dashboard", "create_users", etc.
  if (parts.length >= 2) {
    // Take the last part as the category
    return parts[parts.length - 1];
  }
  
  return "general";
}
