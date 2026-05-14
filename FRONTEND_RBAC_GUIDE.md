# Frontend RBAC Implementation Guide

## Overview
This guide explains how to implement Role-Based Access Control (RBAC) in the frontend React/TypeScript application.

## Files Created

### Type Definitions
- `src/types/rbac.ts` - TypeScript types for roles, permissions, users, workflows

### Utility Functions
- `src/lib/rbac.ts` - Helper functions for permission and role checks

### React Components
- `src/components/rbac/Can.tsx` - Conditional rendering based on permissions
- `src/components/rbac/RoleBadge.tsx` - Display role badges
- `src/components/rbac/ProtectedRoute.tsx` - Route protection
- `src/components/workflow/WorkflowTimeline.tsx` - Workflow progress visualization

### Hooks
- `src/hooks/useAuth.ts` - Authentication state management

## Usage Examples

### 1. Conditional Rendering with `Can` Component

```tsx
import { Can } from "@/components/rbac/Can";

function MyComponent() {
  return (
    <div>
      {/* Show button only if user has permission */}
      <Can permission="create_users">
        <Button>Create User</Button>
      </Can>

      {/* Show section only for ITDB Administrators */}
      <Can role="itdb_administrator">
        <AdminPanel />
      </Can>

      {/* Multiple permissions (any) */}
      <Can permission={["approve_requests", "reject_requests"]}>
        <ApprovalButtons />
      </Can>

      {/* With fallback */}
      <Can permission="view_reports" fallback={<p>Access denied</p>}>
        <ReportsList />
      </Can>
    </div>
  );
}
```

### 2. Protected Routes

```tsx
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";

export const Route = createFileRoute("/admin/users")({
  component: () => (
    <ProtectedRoute permission="view_users">
      <UsersPage />
    </ProtectedRoute>
  ),
});

// Role-based protection
export const Route = createFileRoute("/admin/settings")({
  component: () => (
    <ProtectedRoute role="itdb_administrator">
      <SettingsPage />
    </ProtectedRoute>
  ),
});
```

### 3. Using RBAC Utility Functions

```tsx
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, hasRole, isITDBAdmin } from "@/lib/rbac";

function MyComponent() {
  const { user } = useAuth();

  // Check permission
  if (hasPermission(user, "create_requests")) {
    // Show create button
  }

  // Check role
  if (hasRole(user, "itdb_administrator")) {
    // Show admin features
  }

  // Check if ITDB Admin
  if (isITDBAdmin(user)) {
    // Admin-only logic
  }

  // Check resource access
  if (canViewResource(user, resourceSubCity)) {
    // Show resource
  }

  return <div>...</div>;
}
```

### 4. Display Role Badges

```tsx
import { RoleBadge } from "@/components/rbac/RoleBadge";

function UserCard({ user }) {
  return (
    <Card>
      <h3>{user.name}</h3>
      <div className="flex gap-2">
        {user.roles.map((role) => (
          <RoleBadge key={role.name} role={role.name} />
        ))}
      </div>
    </Card>
  );
}
```

### 5. Workflow Timeline

```tsx
import { WorkflowTimeline } from "@/components/workflow/WorkflowTimeline";

function RequestDetails({ request }) {
  return (
    <div>
      <h2>{request.title}</h2>
      
      {request.workflow_instance && (
        <WorkflowTimeline instance={request.workflow_instance} />
      )}
    </div>
  );
}
```

### 6. Dynamic Navigation Based on Permissions

```tsx
import { useAuth } from "@/hooks/useAuth";
import { filterNavByPermissions } from "@/lib/rbac";

const allNavItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, permission: "view_dashboard" },
  { to: "/requests", label: "Requests", icon: FileStack, permission: "view_requests" },
  { to: "/users", label: "Users", icon: Users, permission: "view_users" },
  { to: "/settings", label: "Settings", icon: Settings, role: "itdb_administrator" },
];

function Sidebar() {
  const { user } = useAuth();
  const navItems = filterNavByPermissions(allNavItems, user);

  return (
    <nav>
      {navItems.map((item) => (
        <NavLink key={item.to} to={item.to}>
          <item.icon />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
```

### 7. API Calls with Authentication

```tsx
import { apiGet, apiPost } from "@/lib/api";

// The API functions automatically include the Bearer token

async function fetchUsers() {
  const response = await apiGet<{ data: User[] }>("/users");
  return response.data;
}

async function createUser(userData: CreateUserData) {
  const response = await apiPost<{ data: User }>("/users", userData);
  return response.data;
}

// Handle permission errors
try {
  await apiPost("/users", userData);
} catch (error) {
  if (error.message.includes("Unauthorized")) {
    toast.error("You don't have permission to create users");
  }
}
```

### 8. Login Flow

```tsx
import { login, setAuthToken } from "@/lib/api";
import { useNavigate } from "@tanstack/react-router";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await login(email, password);
      
      // Token is automatically stored by login function
      // User data includes roles and permissions
      console.log("User:", response.user);
      console.log("Roles:", response.user.roles);
      console.log("Permissions:", response.user.permissions);
      
      // Redirect based on role
      if (response.user.roles.some(r => r.name === "itdb_administrator")) {
        navigate({ to: "/dashboard/executive" });
      } else if (response.user.roles.some(r => r.name === "sub_city_administrator")) {
        navigate({ to: "/dashboard/subcity" });
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (error) {
      toast.error("Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button type="submit">Login</Button>
    </form>
  );
}
```

### 9. User Management Page (ITDB Admin Only)

```tsx
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";
import { RoleBadge } from "@/components/rbac/RoleBadge";
import { Can } from "@/components/rbac/Can";

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    apiGet<{ data: User[] }>("/users").then((res) => setUsers(res.data));
  }, []);

  return (
    <ProtectedRoute permission="view_users">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1>User Management</h1>
          
          <Can permission="create_users">
            <Button onClick={() => navigate({ to: "/users/create" })}>
              Create User
            </Button>
          </Can>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {user.roles.map((role) => (
                      <RoleBadge key={role.name} role={role.name} />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? "default" : "secondary"}>
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Can permission="edit_users">
                    <Button size="sm" variant="ghost">Edit</Button>
                  </Can>
                  <Can permission="delete_users">
                    <Button size="sm" variant="ghost">Delete</Button>
                  </Can>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ProtectedRoute>
  );
}
```

### 10. Workflow Approval Interface

```tsx
import { WorkflowTimeline } from "@/components/workflow/WorkflowTimeline";
import { Can } from "@/components/rbac/Can";

function RequestApprovalPage({ requestId }: { requestId: string }) {
  const [request, setRequest] = useState<TechnologyRequest | null>(null);

  useEffect(() => {
    apiGet<{ data: TechnologyRequest }>(`/requests/${requestId}`).then((res) =>
      setRequest(res.data)
    );
  }, [requestId]);

  const handleApprove = async () => {
    await apiPost(`/workflows/instances/${request.workflow_instance_id}/approve`, {
      comments: "Approved",
    });
    toast.success("Request approved");
  };

  const handleReject = async () => {
    await apiPost(`/workflows/instances/${request.workflow_instance_id}/reject`, {
      comments: "Rejected due to budget constraints",
    });
    toast.success("Request rejected");
  };

  if (!request) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{request.title}</CardTitle>
          <CardDescription>{request.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Office</dt>
              <dd className="text-sm text-gray-900">{request.office}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Budget</dt>
              <dd className="text-sm text-gray-900">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "ETB",
                }).format(request.budget || 0)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {request.workflow_instance && (
        <WorkflowTimeline instance={request.workflow_instance} />
      )}

      <Can permission="approve_requests">
        <Card>
          <CardHeader>
            <CardTitle>Approval Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={handleApprove} className="bg-green-600">
                Approve
              </Button>
              <Button onClick={handleReject} variant="destructive">
                Reject
              </Button>
              <Button variant="outline">Request Revision</Button>
            </div>
          </CardContent>
        </Card>
      </Can>
    </div>
  );
}
```

## Role-Specific Dashboards

### ITDB Administrator Dashboard
```tsx
function ExecutiveDashboard() {
  return (
    <ProtectedRoute role="itdb_administrator">
      <div className="space-y-6">
        <h1>Executive Dashboard</h1>
        
        {/* Global Analytics */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Total Requests" value="142" />
          <StatCard title="Pending Approvals" value="23" />
          <StatCard title="Active Technologies" value="87" />
          <StatCard title="Compliance Score" value="94%" />
        </div>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <PendingApprovalsList />
          </CardContent>
        </Card>

        {/* Cybersecurity Status */}
        <Card>
          <CardHeader>
            <CardTitle>Cybersecurity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <CybersecurityMetrics />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
```

### Sub-City Administrator Dashboard
```tsx
function SubCityDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute role="sub_city_administrator">
      <div className="space-y-6">
        <h1>{user?.sub_city} Sub-City Dashboard</h1>
        
        {/* Sub-City Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard title="My Requests" value="12" />
          <StatCard title="Active Technologies" value="8" />
          <StatCard title="Pending Audits" value="2" />
        </div>

        {/* Request Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>My Technology Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <MyRequestsList subCity={user?.sub_city} />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
```

### Auditor Dashboard
```tsx
function AuditorDashboard() {
  return (
    <ProtectedRoute role="auditor">
      <div className="space-y-6">
        <h1>Auditor Dashboard</h1>
        
        {/* Audit Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Scheduled Audits" value="15" />
          <StatCard title="In Progress" value="7" />
          <StatCard title="Completed" value="42" />
          <StatCard title="Avg Compliance" value="89%" />
        </div>

        {/* Audit Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Audits</CardTitle>
          </CardHeader>
          <CardContent>
            <AuditScheduleList />
          </CardContent>
        </Card>

        {/* Risk Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskHeatmap />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
```

## Best Practices

1. **Always check permissions on both frontend and backend**
   - Frontend checks improve UX
   - Backend checks ensure security

2. **Use the `Can` component for conditional rendering**
   - Cleaner than inline permission checks
   - Consistent across the app

3. **Protect routes with `ProtectedRoute`**
   - Prevents unauthorized access
   - Provides consistent error handling

4. **Handle API errors gracefully**
   - Show user-friendly messages
   - Log errors for debugging

5. **Cache user data appropriately**
   - Reduce API calls
   - Keep permissions up-to-date

6. **Test with different roles**
   - Verify each role sees correct UI
   - Test permission boundaries

## Testing

### Test with Different Users
```bash
# ITDB Administrator
Email: admin@itdb.gov.et
Password: password123

# Sub-City Administrator
Email: subcity@addis.gov.et
Password: password123

# Auditor
Email: auditor@itdb.gov.et
Password: password123
```

### Verify Permissions
1. Login as each user type
2. Check navigation menu (should show only allowed items)
3. Try accessing restricted pages (should redirect or show error)
4. Test CRUD operations (should only work with proper permissions)
5. Test workflow approvals (should only work for authorized roles)

## Next Steps

1. Implement remaining pages with RBAC
2. Add real-time notifications for workflow updates
3. Implement activity logging UI
4. Add user session management UI
5. Create permission matrix visualization
6. Build workflow builder UI
7. Add audit trail viewer
8. Implement advanced filtering by role/permission

## Support

For questions or issues:
- Check backend RBAC_SETUP.md
- Review API documentation
- Test with provided default users
- Check browser console for errors
