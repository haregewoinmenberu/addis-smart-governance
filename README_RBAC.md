# Addis Smart Governance Platform - RBAC & Workflow System

## 🎯 Project Overview

A comprehensive **Role-Based Access Control (RBAC)** and **Workflow Management System** for the Addis Ababa Smart Governance Platform. This enterprise-grade system manages technology procurement, deployment, and compliance across multiple sub-cities with sophisticated approval workflows and audit trails.

---

## 🚀 Quick Start

### Prerequisites
- PHP 8.2+
- Composer
- MySQL/PostgreSQL
- Node.js 18+
- npm/yarn

### Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies (if not done)
composer install

# Copy environment file
copy .env.example .env

# Configure database in .env
# DB_DATABASE=your_database
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# Run setup script (Windows)
setup-rbac.bat

# OR manually:
php artisan migrate:fresh
php artisan db:seed
php artisan passport:install

# Start server
php artisan serve
```

### Frontend Setup (2 minutes)

```bash
# Navigate to root
cd ..

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

### Test Login

Visit `http://localhost:5173/login` and use:

```
ITDB Administrator:
Email: admin@itdb.gov.et
Password: password123

Sub-City Administrator:
Email: subcity@addis.gov.et
Password: password123

Auditor:
Email: auditor@itdb.gov.et
Password: password123
```

---

## 📋 System Features

### ✅ Role-Based Access Control
- **3 User Roles**: ITDB Administrator, Sub-City Administrator, Auditor
- **50+ Permissions**: Granular control over system features
- **Dynamic Role Assignment**: Assign multiple roles per user
- **Permission Inheritance**: Roles inherit permissions automatically

### ✅ Workflow Management
- **8-Stage Approval Process**: From submission to deployment
- **Dynamic Workflow Engine**: Configurable stages and actions
- **Role-Based Approvals**: Each stage requires specific roles
- **Auto-Advance**: Automatic progression for system stages
- **Revision Requests**: Send back for modifications
- **Complete Audit Trail**: Track every approval action

### ✅ User Management
- **User Registration**: ITDB Admin can create users
- **Role Assignment**: Assign roles during user creation
- **Account Management**: Activate/deactivate users
- **Password Reset**: Admin can reset user passwords
- **Activity Tracking**: View user activity logs
- **Session Management**: View and revoke active sessions

### ✅ Security Features
- **Activity Logging**: All actions logged with details
- **Session Tracking**: Monitor active user sessions
- **Token-Based Auth**: Laravel Passport OAuth2
- **Password Hashing**: Bcrypt encryption
- **MFA Ready**: Fields prepared for 2FA
- **IP Tracking**: Log IP addresses for security

### ✅ Technology Request Workflow
1. **Submission** - Sub-City Admin creates request
2. **Validation** - System validates automatically
3. **Duplication Analysis** - Check for existing solutions
4. **Feasibility Study** - Technical/financial assessment
5. **Auditor Review** - Compliance check
6. **ITDB Approval** - Final decision
7. **Deployment** - Track implementation
8. **Audit** - Post-deployment compliance

---

## 👥 User Roles Explained

### 🛡️ ITDB Administrator
**Main authority with full system oversight**

**Can Do:**
- Register and manage all users
- Assign roles and permissions
- Approve/reject all requests
- Configure workflows
- Manage system settings
- Approve vendors
- View all reports and analytics
- Monitor cybersecurity
- Access all modules

**Dashboard:**
- Executive-level analytics
- Global compliance overview
- Pending approvals (all sub-cities)
- Cybersecurity status
- Technology distribution
- Risk indicators

### 🏛️ Sub-City Administrator
**Represents a sub-city government office**

**Can Do:**
- Submit technology requests
- Upload supporting documents
- Update deployment statuses
- Manage sub-city technologies
- View own reports
- Respond to audits
- Participate in surveys
- Track approval workflows

**Cannot Do:**
- Access other sub-city data
- Manage system settings
- Register users
- Approve final requests

**Dashboard:**
- Sub-city technology statistics
- Request tracking
- Infrastructure overview
- Pending approvals
- Audit responses

### 📋 Auditor
**Independent regulatory and compliance role**

**Can Do:**
- Access audit modules
- Conduct compliance reviews
- Generate audit reports
- View technology registry
- Evaluate risk/compliance
- Schedule audits
- Review cybersecurity incidents
- Submit audit findings
- Monitor corrective actions

**Cannot Do:**
- Modify system settings
- Register users
- Approve procurement requests
- Alter workflow configurations

**Dashboard:**
- Audit schedules
- Compliance metrics
- Risk heatmaps
- Corrective actions
- Security review panels

---

## 🗂️ Project Structure

```
addis-smart-governance/
├── backend/
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   │   ├── AuthController.php (Enhanced)
│   │   │   │   ├── UserController.php (Enhanced)
│   │   │   │   ├── WorkflowController.php (Enhanced)
│   │   │   │   └── RoleController.php (New)
│   │   │   └── Middleware/
│   │   │       ├── CheckRole.php (New)
│   │   │       ├── CheckPermission.php (New)
│   │   │       └── LogActivity.php (New)
│   │   ├── Models/
│   │   │   ├── User.php (Enhanced)
│   │   │   ├── Role.php (New)
│   │   │   ├── Permission.php (New)
│   │   │   ├── WorkflowDefinition.php (New)
│   │   │   ├── WorkflowInstance.php (New)
│   │   │   ├── WorkflowApproval.php (New)
│   │   │   ├── ActivityLog.php (New)
│   │   │   └── UserSession.php (New)
│   │   └── Traits/
│   │       └── HasRolesAndPermissions.php (New)
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── 2024_01_01_000001_create_roles_and_permissions_tables.php
│   │   │   ├── 2024_01_01_000002_create_workflow_system_tables.php
│   │   │   └── 2024_01_01_000003_create_activity_logs_table.php
│   │   └── seeders/
│   │       ├── RolesAndPermissionsSeeder.php
│   │       ├── WorkflowDefinitionsSeeder.php
│   │       └── DefaultUsersSeeder.php
│   ├── routes/
│   │   └── api.php (Enhanced with RBAC)
│   ├── setup-rbac.bat (Setup script)
│   └── RBAC_SETUP.md (Backend guide)
├── src/
│   ├── components/
│   │   ├── rbac/
│   │   │   ├── Can.tsx (New)
│   │   │   ├── RoleBadge.tsx (New)
│   │   │   └── ProtectedRoute.tsx (New)
│   │   └── workflow/
│   │       └── WorkflowTimeline.tsx (New)
│   ├── hooks/
│   │   └── useAuth.ts (New)
│   ├── lib/
│   │   └── rbac.ts (New)
│   └── types/
│       └── rbac.ts (New)
├── FRONTEND_RBAC_GUIDE.md (Frontend guide)
├── RBAC_IMPLEMENTATION_SUMMARY.md (Overview)
└── README_RBAC.md (This file)
```

---

## 📡 API Reference

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@itdb.gov.et",
  "password": "password123"
}

Response:
{
  "token_type": "Bearer",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "expires_at": "2026-05-14T12:00:00.000000Z",
  "user": {
    "id": 1,
    "name": "ITDB Administrator",
    "email": "admin@itdb.gov.et",
    "roles": [
      {
        "name": "itdb_administrator",
        "display_name": "ITDB Administrator"
      }
    ],
    "permissions": ["view_users", "create_users", ...]
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}

Response:
{
  "user": {
    "id": 1,
    "name": "ITDB Administrator",
    "roles": [...],
    "permissions": [...]
  }
}
```

### Users (ITDB Admin Only)

#### List Users
```http
GET /api/users?role=sub_city_administrator&search=bole
Authorization: Bearer {token}

Response:
{
  "data": [
    {
      "id": 2,
      "name": "Bole Sub-City Admin",
      "email": "subcity@addis.gov.et",
      "sub_city": "Bole",
      "roles": [...]
    }
  ]
}
```

#### Create User
```http
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "phone": "+251911000003",
  "sub_city": "Kirkos",
  "department": "IT",
  "roles": ["sub_city_administrator"],
  "is_active": true
}
```

### Workflows

#### List Workflow Instances
```http
GET /api/workflows/instances?status=in_progress&my_approvals=true
Authorization: Bearer {token}

Response:
{
  "data": [
    {
      "id": 1,
      "current_stage": "auditor_review",
      "status": "in_progress",
      "definition": {...},
      "approvals": [...]
    }
  ]
}
```

#### Approve Workflow Stage
```http
POST /api/workflows/instances/1/approve
Authorization: Bearer {token}
Content-Type: application/json

{
  "comments": "Approved after review",
  "metadata": {
    "risk_score": 85
  }
}
```

---

## 💻 Frontend Usage Examples

### Conditional Rendering

```tsx
import { Can } from "@/components/rbac/Can";

function MyPage() {
  return (
    <div>
      {/* Show only if user has permission */}
      <Can permission="create_users">
        <Button>Create User</Button>
      </Can>

      {/* Show only for specific role */}
      <Can role="itdb_administrator">
        <AdminPanel />
      </Can>

      {/* Multiple permissions */}
      <Can permission={["approve_requests", "reject_requests"]}>
        <ApprovalButtons />
      </Can>
    </div>
  );
}
```

### Protected Routes

```tsx
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";

export const Route = createFileRoute("/admin/users")({
  component: () => (
    <ProtectedRoute permission="view_users">
      <UsersPage />
    </ProtectedRoute>
  ),
});
```

### Permission Checks

```tsx
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, hasRole } from "@/lib/rbac";

function MyComponent() {
  const { user } = useAuth();

  if (hasPermission(user, "approve_requests")) {
    // Show approval button
  }

  if (hasRole(user, "itdb_administrator")) {
    // Show admin features
  }

  return <div>...</div>;
}
```

---

## 🧪 Testing

### Test with Different Roles

1. **Login as ITDB Administrator**
   - Should see all navigation items
   - Can create users
   - Can approve requests
   - Can configure workflows

2. **Login as Sub-City Administrator**
   - Limited navigation items
   - Can create requests
   - Cannot create users
   - Cannot approve requests

3. **Login as Auditor**
   - Audit-focused navigation
   - Can view all requests
   - Can conduct audits
   - Cannot approve procurement

### API Testing with cURL

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@itdb.gov.et","password":"password123"}'

# Get users (requires permission)
curl -X GET http://localhost:8000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create user (ITDB Admin only)
curl -X POST http://localhost:8000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","roles":["sub_city_administrator"]}'
```

---

## 📚 Documentation Files

1. **README_RBAC.md** (This file) - Quick start and overview
2. **RBAC_IMPLEMENTATION_SUMMARY.md** - Detailed implementation summary
3. **backend/RBAC_SETUP.md** - Backend setup and API reference
4. **FRONTEND_RBAC_GUIDE.md** - Frontend implementation guide

---

## 🔧 Troubleshooting

### Common Issues

**Migration Errors**
```bash
# Reset database
php artisan migrate:fresh --seed

# Check migration status
php artisan migrate:status
```

**Permission Denied (403)**
- Check user has correct role
- Verify permission is assigned to role
- Check API route middleware

**Token Expired**
- Login again to get new token
- Check token expiration in Passport config

**Frontend Not Showing Content**
- Check browser console for errors
- Verify API_URL in .env
- Check authentication token in localStorage

---

## 🎯 Next Steps

### Immediate
1. ✅ Run setup script
2. ✅ Test with default users
3. ✅ Explore API endpoints
4. ✅ Test frontend components

### Short Term
- [ ] Customize workflow stages
- [ ] Add email notifications
- [ ] Implement remaining UI pages
- [ ] Add more permissions as needed
- [ ] Create custom dashboards

### Long Term
- [ ] Implement MFA
- [ ] Add real-time notifications
- [ ] Build workflow builder UI
- [ ] Create advanced reporting
- [ ] Mobile app integration

---

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review API endpoints with Postman
3. Test with provided default users
4. Check Laravel logs: `backend/storage/logs/laravel.log`
5. Check browser console for frontend errors

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👏 Credits

Built for the Addis Ababa Smart Governance Platform
Implementation Date: May 13, 2026
Version: 1.0.0

---

**🎉 You're all set! Start the servers and test the system with the default users.**
