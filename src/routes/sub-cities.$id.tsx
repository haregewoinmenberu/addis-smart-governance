import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { getSubCity } from "@/lib/api";
import { ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/sub-cities/$id")({
  head: () => ({ meta: [{ title: "Sub-City Details — STRP" }] }),
  component: () => (
    <RequireAuth>
      <PermissionGuard permission="view_sub_cities">
        <Page />
      </PermissionGuard>
    </RequireAuth>
  ),
});

function Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { data: subCityData, isLoading } = useQuery({
    queryKey: ["sub-city", id],
    queryFn: () => getSubCity(id),
  });

  const raw = subCityData as any;
  const subCity = raw?.sub_city ?? raw?.data ?? raw;
  const users = subCity?.users ?? [];

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!subCity) {
    return (
      <AppShell>
        <div className="py-12 text-center text-muted-foreground">Sub-city not found.</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={subCity.name}
        subtitle="Sub-city details and statistics"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/sub-cities" })}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Sub-Cities
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>Core information about the sub-city organization</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Code</p>
              <p className="font-medium">{subCity.code}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant={subCity.is_active ? "default" : "secondary"}>
                {subCity.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{subCity.email || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium">{subCity.phone || "—"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="font-medium">{subCity.address || "—"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Description</p>
              <p className="font-medium">{subCity.description || "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Administrator</CardTitle>
            <CardDescription>Assigned sub-city administrator</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="font-medium">{subCity.admin_name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{subCity.admin_email || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium">{subCity.admin_phone || "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Usage and activity snapshot</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Users</p>
              <p className="text-2xl font-semibold">{subCity.statistics?.total_users ?? 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Users</p>
              <p className="text-2xl font-semibold">{subCity.statistics?.active_users ?? 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Technologies</p>
              <p className="text-2xl font-semibold">{subCity.statistics?.total_technologies ?? 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending Requests</p>
              <p className="text-2xl font-semibold">{subCity.statistics?.pending_requests ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Accounts mapped to this sub-city</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No users assigned
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.department || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "default" : "secondary"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
