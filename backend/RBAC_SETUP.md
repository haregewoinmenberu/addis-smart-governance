# RBAC & Workflow System Setup Guide

## Overview
This document provides instructions for setting up the Role-Based Access Control (RBAC) and Workflow Management system for the Addis Smart Governance Platform.

## Database Setup

### 1. Run Migrations
```bash
cd backend
php artisan migrate:fresh
```

This will create the following tables:
- `roles` - Role definitions
- `permissions` - Permission definitions
- `permission_role` - Role-permission relationships
- `role_user` - User-role relationships
- `workflow_definitions` - Workflow templates
- `workflow_instances` - Active workflow executions
- `workflow_approvals` - Approval actions
- `activity_logs` - User activity tracking
- `user_sessions` - Session management

### 2. Seed Data
```bash
php artisan db:seed
```

This will create:
- **3 Roles**: ITDB Administrator, Sub-City Administrator, Auditor
- **50+ Permissions**: Organized by module
- **3 Default Users**:
  - ITDB Admin: `admin@itdb.gov.et` / `password123`
  - Sub-City Admin: `subcity@addis.gov.et` / `password123`
  - Auditor: `auditor@itdb.gov.et` / `password123`
- **2 Workflow Definitions**: Technology Request Approval, Vendor Approval
- Sample data for testing

### 3. Install Passport (if not already done)
```bash
php artisan passport:install
```

## System Architecture

### Roles & Permissions

#### 1. ITDB Administrator
**Full system access with oversight capabilities**

Permissions:
- All user management (create, edit, delete, assign roles)
- All request management (view all, approve, reject)
- All technology registry access
- Workflow configuration
- System settings management
- Vendor approval
- View all reports and analytics
- Cybersecurity governance
- Audit oversight

Dashboard Features:
- Executive-level analytics
- Global compliance overview
- Pending approvals across all sub-cities
- Cybersecurity status
- Technology distribution
- Risk indicators
- AI insights

#### 2. Sub-City Administrator
**Represents a sub-city government office**

Permissions:
- Submit technology requests
- Edit own requests
- View own technologies
- Respond to audits
- Participate in surveys
- View notifications
- Track approval workflows

Restrictions:
- Cannot access other sub-city data
- Cannot manage system settings
- Cannot register users
- Cannot approve final requests

Dashboard Features:
- Sub-city technology statistics
- Request tracking
- Infrastructure overview
- Pending approvals
- Audit responses

#### 3. Auditor
**Independent regulatory and compliance role**

Permissions:
- View all requests and technologies
- Create and conduct audits
- Generate audit reports
- Review cybersecurity incidents
- Perform duplication analysis
- Conduct feasibility studies
- Export reports

Restrictions:
- Cannot modify system settings
- Cannot register users
- Cannot approve procurement requests
- Cannot alter workflow configurations

Dashboard Features:
- Audit schedules
- Compliance metrics
- Risk heatmaps
- Corrective actions
- Security review panels

### Workflow System

#### Technology Request Workflow (8 Stages)

1. **Request Submission** (Sub-City Admin)
   - Create request with documents
   - Provide budget estimation
   - Select category
   - Auto-advances on submit

2. **Initial Validation** (System)
   - Validates required fields
   - Checks duplicates
   - Basic compliance validation
   - Auto-advances

3. **Duplication Analysis** (ITDB Admin)
   - Check existing technologies
   - Similarity scoring
   - Reusability recommendations
   - Manual approval required

4. **Feasibility Evaluation** (Auditor)
   - Technical feasibility
   - Financial feasibility
   - Security assessment
   - Infrastructure readiness
   - Manual approval required

5. **Auditor Review** (Auditor)
   - Compliance assessment
   - Risk evaluation
   - Can approve, reject, or request revision

6. **ITDB Administrator Approval** (ITDB Admin)
   - Final approval decision
   - Can approve, reject, or request revision

7. **Deployment Monitoring** (Sub-City Admin)
   - Track implementation progress
   - Upload deployment evidence
   - Update operational status

8. **Audit & Compliance Monitoring** (Auditor)
   - Post-deployment audit
   - Compliance verification
   - Close workflow

#### Workflow Actions
- **Approve**: Move to next stage
- **Reject**: End workflow with rejection
- **Request Revision**: Send back for modifications
- **Auto-advance**: System automatically moves to next stage

## API Endpoints

### Authentication
```
POST   /api/auth/login              - Login
POST   /api/auth/logout             - Logout
GET    /api/auth/me                 - Get current user
GET    /api/auth/sessions           - Get active sessions
DELETE /api/auth/sessions/{id}      - Revoke session
```

### Users (ITDB Admin only for create/edit/delete)
```
GET    /api/users                   - List users (filterable)
POST   /api/users                   - Create user
GET    /api/users/{id}              - Get user details
PUT    /api/users/{id}              - Update user
DELETE /api/users/{id}              - Delete user
POST   /api/users/{id}/toggle-active - Activate/deactivate
POST   /api/users/{id}/reset-password - Reset password
GET    /api/users/{id}/activity     - Get activity logs
```

### Roles & Permissions (ITDB Admin only)
```
GET    /api/roles                   - List all roles
GET    /api/roles/{id}              - Get role details
PUT    /api/roles/{id}/permissions  - Update role permissions
GET    /api/permissions             - List all permissions
```

### Workflows
```
GET    /api/workflows               - List workflow definitions
POST   /api/workflows               - Create workflow
GET    /api/workflows/{id}          - Get workflow details
PUT    /api/workflows/{id}          - Update workflow
DELETE /api/workflows/{id}          - Delete workflow
GET    /api/workflows/instances     - List workflow instances
GET    /api/workflows/instances/{id} - Get instance details
POST   /api/workflows/instances/{id}/approve - Approve stage
POST   /api/workflows/instances/{id}/reject - Reject workflow
POST   /api/workflows/instances/{id}/request-revision - Request revision
GET    /api/workflows/analytics     - Get workflow analytics
```

### Technology Requests
```
GET    /api/requests                - List requests (filtered by role)
POST   /api/requests                - Create request
GET    /api/requests/{id}           - Get request details
PUT    /api/requests/{id}           - Update request
DELETE /api/requests/{id}           - Delete request
POST   /api/requests/{id}/submit    - Submit request (starts workflow)
```

## Middleware

### Role Middleware
```php
Route::middleware('role:itdb_administrator')->group(function () {
    // ITDB Admin only routes
});

Route::middleware('role:itdb_administrator,auditor')->group(function () {
    // ITDB Admin OR Auditor routes
});
```

### Permission Middleware
```php
Route::middleware('permission:approve_requests')->group(function () {
    // Routes requiring approve_requests permission
});
```

### Activity Logging Middleware
Automatically logs all state-changing operations (POST, PUT, PATCH, DELETE) for authenticated users.

## Usage Examples

### Check User Permissions (Backend)
```php
// Check if user has role
if ($user->hasRole('itdb_administrator')) {
    // ITDB Admin logic
}

// Check if user has permission
if ($user->hasPermission('approve_requests')) {
    // Approval logic
}

// Get all user permissions
$permissions = $user->getAllPermissions();
```

### Assign Roles
```php
// Assign single role
$user->assignRole('sub_city_administrator');

// Sync multiple roles
$user->syncRoles(['auditor', 'sub_city_administrator']);

// Remove role
$user->removeRole('auditor');
```

### Create Workflow Instance
```php
use App\Models\WorkflowDefinition;
use App\Models\WorkflowInstance;

$workflow = WorkflowDefinition::where('code', 'tech_request_approval')->first();

$instance = WorkflowInstance::create([
    'workflow_definition_id' => $workflow->id,
    'workflowable_type' => RequestItem::class,
    'workflowable_id' => $request->id,
    'current_stage' => $workflow->stages[0]['name'],
    'current_stage_index' => 0,
    'status' => 'in_progress',
    'started_at' => now(),
]);
```

### Approve Workflow Stage
```php
$instance = WorkflowInstance::find($id);
$approval = $instance->currentApproval();

$approval->update([
    'approver_id' => auth()->id(),
    'action' => 'approved',
    'comments' => 'Looks good',
    'actioned_at' => now(),
]);

$instance->advanceToNextStage();
```

## Security Features

### Activity Logging
All user actions are logged with:
- User ID
- Action type (create, update, delete, approve, etc.)
- Module
- Subject entity
- Old/new values
- IP address
- User agent
- Timestamp

### Session Management
- Track active sessions per user
- View all active sessions
- Revoke individual sessions
- Automatic session expiration
- Last activity tracking

### Password Security
- Minimum 8 characters
- Hashed using bcrypt
- Password reset functionality
- Admin can reset user passwords

### Account Security
- Account activation/deactivation
- Last login tracking
- MFA support (fields ready)
- Email verification (ready to implement)

## Testing

### Test User Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@itdb.gov.et","password":"password123"}'
```

### Test Protected Endpoint
```bash
curl -X GET http://localhost:8000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Permission Check
```bash
# This should work for ITDB Admin
curl -X POST http://localhost:8000/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","roles":["sub_city_administrator"]}'

# This should fail (403) for Sub-City Admin
curl -X POST http://localhost:8000/api/users \
  -H "Authorization: Bearer SUBCITY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","roles":["sub_city_administrator"]}'
```

## Troubleshooting

### Migration Issues
```bash
# Reset database
php artisan migrate:fresh --seed

# Check migration status
php artisan migrate:status
```

### Permission Issues
```bash
# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### Passport Issues
```bash
# Reinstall Passport
php artisan passport:install --force
```

## Next Steps

1. **Frontend Integration**: Implement role-based UI components
2. **Email Notifications**: Set up email for workflow notifications
3. **MFA Implementation**: Add two-factor authentication
4. **Advanced Workflows**: Create custom workflow builder UI
5. **Reporting**: Build comprehensive audit and compliance reports
6. **API Documentation**: Generate Swagger/OpenAPI documentation

## Support

For issues or questions, contact the development team or refer to:
- Laravel Documentation: https://laravel.com/docs
- Laravel Passport: https://laravel.com/docs/passport
- Project Repository: [Your repo URL]
