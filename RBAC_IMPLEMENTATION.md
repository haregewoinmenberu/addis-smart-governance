# Role-Based Access Control (RBAC) Implementation

## Overview
This document describes the comprehensive RBAC system implemented across the frontend and backend of the Addis Smart Governance Portal.

## Components Created

### 1. Permission Hooks (`src/hooks/usePermissions.ts`)
A comprehensive hook that provides utilities to check user permissions and roles:

**Functions:**
- `hasPermission(permission)` - Check if user has a specific permission
- `hasAnyPermission(permissions[])` - Check if user has any of the specified permissions
- `hasAllPermissions(permissions[])` - Check if user has all specified permissions
- `hasRole(role)` - Check if user has a specific role
- `hasAnyRole(roles[])` - Check if user has any of the specified roles
- `hasAllRoles(roles[])` - Check if user has all specified roles
- `isITDBAdmin()` - Check if user is ITDB Administrator
- `isSubCityAdmin()` - Check if user is Sub-City Administrator
- `isAuditor()` - Check if user is Auditor

**Usage Example:**
```typescript
import { usePermissions } from "@/hooks/usePermissions";

function MyComponent() {
  const { hasPermission, isITDBAdmin } = usePermissions();
  
  if (hasPermission('create_users')) {
    // Show create user button
  }
  
  if (isITDBAdmin()) {
    // Show admin panel
  }
}
```

### 2. Permission Guard Component (`src/components/auth/PermissionGuard.tsx`)
Conditionally renders children based on user permissions.

**Props:**
- `permission` - Single permission to check
- `permissions` - Array of permissions to check
- `requireAll` - If true, requires all permissions (default: false)
- `fallback` - Component to render if access denied
- `children` - Content to render if access granted

**Usage Example:**
```typescript
<PermissionGuard permission="create_users">
  <Button>Create User</Button>
</PermissionGuard>

<PermissionGuard 
  permissions={["edit_users", "delete_users"]} 
  requireAll={false}
>
  <UserActions />
</PermissionGuard>
```

### 3. Role Guard Component (`src/components/auth/RoleGuard.tsx`)
Conditionally renders children based on user roles.

**Props:**
- `role` - Single role to check
- `roles` - Array of roles to check
- `requireAll` - If true, requires all roles (default: false)
- `fallback` - Component to render if access denied
- `children` - Content to render if access granted

**Usage Example:**
```typescript
<RoleGuard role="itdb_administrator">
  <AdminPanel />
</RoleGuard>

<RoleGuard 
  roles={["itdb_administrator", "sub_city_administrator"]} 
  requireAll={false}
>
  <ManagementTools />
</RoleGuard>
```

### 4. Updated Sidebar with Permission-Based Navigation
The sidebar now automatically shows/hides menu items based on user permissions.

**Features:**
- Each navigation item can specify required permissions
- Admin-only items are only visible to ITDB administrators
- Automatically filters navigation based on user's permissions
- Supports single permission, multiple permissions, or role-based access

**Navigation Item Structure:**
```typescript
{
  to: "/users",
  label: "User Management",
  icon: Users,
  permission: "view_users"  // Single permission
}

{
  to: "/admin",
  label: "Admin Panel",
  icon: Settings,
  adminOnly: true  // Only for ITDB admins
}
```

### 5. Sub-Cities API Functions
Added comprehensive API functions for sub-city management:

- `getSubCities(params)` - Get paginated list of sub-cities
- `getSubCity(id)` - Get single sub-city details
- `createSubCity(data)` - Create new sub-city
- `updateSubCity(id, data)` - Update sub-city
- `deleteSubCity(id)` - Delete sub-city
- `activateSubCity(id)` - Activate sub-city
- `deactivateSubCity(id)` - Deactivate sub-city
- `getSubCityStatistics(id)` - Get sub-city statistics
- `getSubCityUsers(id)` - Get users in sub-city
- `updateSubCityAdministrator(id, data)` - Update sub-city administrator

## Permissions List

### User Management
- `view_users` - View user list
- `create_users` - Create new users
- `edit_users` - Edit existing users
- `delete_users` - Delete users
- `assign_roles` - Assign roles to users

### Technology Requests
- `view_requests` - View technology requests
- `create_requests` - Create new requests
- `edit_requests` - Edit requests
- `delete_requests` - Delete requests
- `approve_requests` - Approve requests
- `reject_requests` - Reject requests
- `view_all_requests` - View all requests across sub-cities

### Technology Registry
- `view_technologies` - View technology registry
- `create_technologies` - Register new technologies
- `edit_technologies` - Edit technology records
- `delete_technologies` - Delete technology records
- `view_all_technologies` - View all technologies across sub-cities

### Audits
- `view_audits` - View audits
- `create_audits` - Create audit records
- `conduct_audits` - Conduct audits
- `view_audit_reports` - View audit reports
- `respond_to_audits` - Respond to audit findings

### Workflows
- `view_workflows` - View workflows
- `create_workflows` - Create workflows
- `edit_workflows` - Edit workflows
- `delete_workflows` - Delete workflows
- `configure_workflows` - Configure workflow settings

### Vendors
- `view_vendors` - View vendor list
- `create_vendors` - Add new vendors
- `edit_vendors` - Edit vendor information
- `approve_vendors` - Approve vendors

### Reports
- `view_reports` - View reports
- `create_reports` - Create reports
- `export_reports` - Export reports
- `view_all_reports` - View all reports across sub-cities

### Cybersecurity
- `view_cybersecurity` - View cybersecurity issues
- `manage_cybersecurity` - Manage cybersecurity
- `review_security_incidents` - Review security incidents

### Settings
- `view_settings` - View settings
- `manage_settings` - Manage system settings

### Dashboard
- `view_dashboard` - View dashboard
- `view_executive_dashboard` - View executive dashboard

### Notifications
- `view_notifications` - View notifications
- `manage_notifications` - Manage notifications

### Surveys
- `view_surveys` - View surveys
- `participate_surveys` - Participate in surveys
- `create_surveys` - Create surveys

### Duplication Analysis
- `view_duplication` - View duplication cases
- `perform_duplication_analysis` - Perform duplication analysis

### Feasibility Studies
- `view_feasibility` - View feasibility studies
- `conduct_feasibility` - Conduct feasibility studies

### Sub-Cities (Admin Only)
- `view_sub_cities` - View sub-cities
- `create_sub_cities` - Create sub-cities
- `edit_sub_cities` - Edit sub-cities
- `delete_sub_cities` - Delete sub-cities

## Roles

### 1. ITDB Administrator (`itdb_administrator`)
**Full system access including:**
- All user management permissions
- All technology management permissions
- All audit permissions
- All workflow configuration permissions
- All vendor management permissions
- All report permissions
- All cybersecurity permissions
- System settings management
- Sub-city management
- Cross-sub-city data access

### 2. Sub-City Administrator (`sub_city_administrator`)
**Sub-city level access including:**
- View and manage users within their sub-city
- Create and manage technology requests
- View and manage technologies within their sub-city
- Respond to audits
- View workflows
- View vendors
- View and create reports for their sub-city
- View cybersecurity issues
- View settings
- View dashboard

### 3. Auditor (`auditor`)
**Audit-focused access including:**
- View users
- View technology requests
- View technologies
- Full audit permissions (create, conduct, view reports)
- View workflows
- View vendors
- View reports
- View cybersecurity issues
- View settings
- View dashboard

## Implementation Guidelines

### Frontend Route Protection
Add permission checks to route `beforeLoad`:

```typescript
export const Route = createFileRoute("/users")({
  beforeLoad: async ({ context }) => {
    const token = getAuthToken();
    if (!token) {
      throw redirect({ to: "/login" });
    }
    
    // Check permission
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const { user } = await response.json();
    
    if (!user.permissions.includes('view_users')) {
      throw redirect({ to: "/" });
    }
  },
  component: UsersPage,
});
```

### Component-Level Protection
Use guards for conditional rendering:

```typescript
function UserManagementPage() {
  return (
    <div>
      <h1>Users</h1>
      
      <PermissionGuard permission="create_users">
        <Button onClick={handleCreate}>Create User</Button>
      </PermissionGuard>
      
      <UserList />
      
      <RoleGuard role="itdb_administrator">
        <AdminTools />
      </RoleGuard>
    </div>
  );
}
```

### API Integration
The backend already has permission middleware in place:

```php
Route::get('users', [UserController::class, 'index'])
    ->middleware('permission:view_users');
    
Route::post('users', [UserController::class, 'store'])
    ->middleware('permission:create_users');
```

## Testing

### Test User Accounts
Created by default seeder:

1. **ITDB Administrator**
   - Email: admin@itdb.gov.et
   - Password: password123
   - Full system access

2. **Sub-City Administrator**
   - Email: subcity@addis.gov.et
   - Password: password123
   - Sub-city level access

3. **Auditor**
   - Email: auditor@itdb.gov.et
   - Password: password123
   - Audit-focused access

### Testing Checklist
- [ ] Login with each role
- [ ] Verify sidebar shows correct menu items
- [ ] Test permission guards on components
- [ ] Test API endpoints with different roles
- [ ] Verify cross-sub-city data isolation
- [ ] Test role assignment and permission changes

## Next Steps

1. **Add Route Protection** - Add `beforeLoad` guards to all protected routes
2. **Implement Page Components** - Create full CRUD pages for each module
3. **Add Permission Checks** - Add PermissionGuard to all action buttons
4. **Test Multi-Tenancy** - Verify sub-city data isolation
5. **Add Audit Logging** - Log all permission-based actions
6. **Create Admin Panel** - Build role and permission management UI

## Security Considerations

1. **Always validate on backend** - Frontend guards are for UX only
2. **Use HTTPS in production** - Protect tokens in transit
3. **Implement token refresh** - Handle token expiration gracefully
4. **Log permission denials** - Track unauthorized access attempts
5. **Regular permission audits** - Review and update permissions regularly
6. **Principle of least privilege** - Grant minimum required permissions

## Support

For questions or issues with RBAC implementation, refer to:
- Backend: `backend/app/Http/Middleware/CheckPermission.php`
- Frontend: `src/hooks/usePermissions.ts`
- Types: `src/types/rbac.ts`
