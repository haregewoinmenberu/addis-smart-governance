# API Routes Documentation - Updated to POST Only

All PUT and DELETE methods have been converted to POST methods with specific action endpoints.

## Summary of Changes

- **PUT** methods → **POST** with `/update` suffix
- **DELETE** methods → **POST** with `/delete` suffix
- All routes now use POST for modifications

## Authentication Routes

### Public
- `POST /api/auth/login` - Login

### Protected
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/profile/update` - Update profile (was PUT /profile)
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/activity-logs` - Get activity logs
- `GET /api/auth/sessions` - Get sessions
- `POST /api/auth/sessions/{id}/revoke` - Revoke session (was DELETE)
- `POST /api/auth/sessions/revoke-all` - Revoke all other sessions

## Dashboard
- `GET /api/dashboard` - Get dashboard data

## Settings
- `GET /api/settings` - Get all settings
- `POST /api/settings/update` - Update settings (was PUT /settings)
- `GET /api/settings/{key}` - Get specific setting
- `POST /api/settings/{key}/update` - Update specific setting (was PUT /settings/{key})
- `POST /api/settings/clear-cache` - Clear cache

## Roles & Permissions (ITDB Administrator only)
- `GET /api/roles` - List all roles
- `GET /api/roles/{role}` - Get role details
- `POST /api/roles/{role}/permissions/update` - Update role permissions (was PUT)
- `GET /api/permissions` - List all permissions

## Sub-Cities Management
- `GET /api/sub-cities` - List all sub-cities
- `POST /api/sub-cities` - Create sub-city
- `GET /api/sub-cities/{id}` - Get sub-city details
- `POST /api/sub-cities/{id}/update` - Update sub-city (was PUT)
- `POST /api/sub-cities/{id}/delete` - Delete sub-city (was DELETE)
- `POST /api/sub-cities/{id}/activate` - Activate sub-city
- `POST /api/sub-cities/{id}/deactivate` - Deactivate sub-city
- `GET /api/sub-cities/{id}/statistics` - Get sub-city statistics
- `GET /api/sub-cities/{id}/users` - Get sub-city users
- `POST /api/sub-cities/{id}/administrator/update` - Update administrator (was PUT)

## Users Management
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `GET /api/users/{id}` - Get user details
- `POST /api/users/{id}/update` - Update user (was PUT)
- `POST /api/users/{id}/delete` - Delete user (was DELETE)
- `POST /api/users/{id}/toggle-active` - Toggle user active status
- `POST /api/users/{id}/reset-password` - Reset user password
- `GET /api/users/{id}/activity` - Get user activity logs

## Technology Requests
- `GET /api/requests` - List all requests
- `POST /api/requests` - Create request
- `GET /api/requests/statistics` - Get request statistics
- `GET /api/requests/{id}` - Get request details
- `POST /api/requests/{id}/update` - Update request (was PUT)
- `POST /api/requests/{id}/delete` - Delete request (was DELETE)
- `POST /api/requests/{id}/submit` - Submit request for approval
- `POST /api/requests/{id}/resubmit` - Resubmit request after revision

## Technology Registry
- `GET /api/technologies` - List all technologies
- `POST /api/technologies` - Create technology
- `GET /api/technologies/statistics` - Get technology statistics
- `GET /api/technologies/{id}` - Get technology details
- `POST /api/technologies/{id}/update` - Update technology (was PUT)
- `POST /api/technologies/{id}/delete` - Delete technology (was DELETE)

## Workflows
- `GET /api/workflows` - List all workflow definitions
- `POST /api/workflows` - Create workflow definition
- `GET /api/workflows/analytics` - Get workflow analytics
- `GET /api/workflows/instances` - List workflow instances
- `GET /api/workflows/instances/my-approvals` - Get my pending approvals
- `GET /api/workflows/instances/{id}` - Get workflow instance details
- `POST /api/workflows/instances/{id}/approve` - Approve workflow stage
- `POST /api/workflows/instances/{id}/reject` - Reject workflow
- `POST /api/workflows/instances/{id}/request-revision` - Request revision
- `POST /api/workflows/instances/{id}/cancel` - Cancel workflow
- `GET /api/workflows/{id}` - Get workflow definition details
- `POST /api/workflows/{id}/update` - Update workflow definition (was PUT)
- `POST /api/workflows/{id}/delete` - Delete workflow definition (was DELETE)

## Audits
- `GET /api/audits` - List all audits
- `POST /api/audits` - Create audit
- `GET /api/audits/{id}` - Get audit details
- `POST /api/audits/{id}/update` - Update audit (was PUT)
- `POST /api/audits/{id}/delete` - Delete audit (was DELETE)

## Vendors
- `GET /api/vendors` - List all vendors
- `POST /api/vendors` - Create vendor
- `GET /api/vendors/{id}` - Get vendor details
- `POST /api/vendors/{id}/update` - Update vendor (was PUT)
- `POST /api/vendors/{id}/delete` - Delete vendor (was DELETE)
- `POST /api/vendors/{id}/approve` - Approve vendor

## Reports
- `GET /api/reports` - List all reports
- `POST /api/reports` - Create report
- `GET /api/reports/{id}` - Get report details
- `GET /api/reports/{id}/export` - Export report

## Cybersecurity
- `GET /api/cybersecurity` - List all cybersecurity issues
- `POST /api/cybersecurity` - Create cybersecurity issue
- `GET /api/cybersecurity/{id}` - Get issue details
- `POST /api/cybersecurity/{id}/update` - Update issue (was PUT)

## Duplication Analysis
- `GET /api/duplications` - List all duplication cases
- `GET /api/duplications/statistics` - Get duplication statistics
- `POST /api/duplications/requests/{requestId}/analyze` - Analyze request for duplications
- `GET /api/duplications/{id}` - Get duplication case details
- `POST /api/duplications/{id}/override` - Override duplication recommendation
- `POST /api/duplications/{id}/delete` - Delete duplication case (was DELETE)

## Feasibility Studies
- `GET /api/feasibility-studies` - List all feasibility studies
- `GET /api/feasibility-studies/criteria` - Get evaluation criteria
- `GET /api/feasibility-studies/statistics` - Get feasibility statistics
- `POST /api/feasibility-studies/requests/{requestId}/evaluate` - Evaluate request feasibility
- `GET /api/feasibility-studies/{id}` - Get feasibility study details
- `POST /api/feasibility-studies/{id}/update` - Update feasibility study (was PUT)
- `POST /api/feasibility-studies/{id}/delete` - Delete feasibility study (was DELETE)

## Surveys
- `GET /api/surveys` - List all surveys
- `POST /api/surveys` - Create survey
- `GET /api/surveys/{id}` - Get survey details
- `POST /api/surveys/{id}/respond` - Submit survey response

## Notifications
- `GET /api/notifications` - List all notifications
- `GET /api/notifications/unread-count` - Get unread count
- `GET /api/notifications/recent` - Get recent notifications
- `GET /api/notifications/statistics` - Get notification statistics
- `GET /api/notifications/{id}` - Get notification details
- `POST /api/notifications/{id}/read` - Mark as read
- `POST /api/notifications/{id}/unread` - Mark as unread
- `POST /api/notifications/read-all` - Mark all as read
- `POST /api/notifications/{id}/delete` - Delete notification (was DELETE)
- `POST /api/notifications/read/delete-all` - Delete all read (was DELETE)
- `POST /api/notifications/all/clear` - Delete all notifications (was DELETE)

## Request/Response Format

### Standard Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Standard Error Response
```json
{
  "message": "Error message",
  "errors": {
    "field": ["Validation error"]
  }
}
```

### Pagination Response
```json
{
  "data": [...],
  "current_page": 1,
  "per_page": 15,
  "total": 100,
  "last_page": 7
}
```

## Authentication

All protected routes require Bearer token:
```
Authorization: Bearer {access_token}
```

## Permissions

Each route is protected by specific permissions. Check the middleware in routes for required permissions.

## Migration Guide for Frontend

### Before (PUT/DELETE):
```javascript
// Update
await api.put(`/users/${id}`, data);

// Delete
await api.delete(`/users/${id}`);
```

### After (POST only):
```javascript
// Update
await api.post(`/users/${id}/update`, data);

// Delete
await api.post(`/users/${id}/delete`);
```

## Testing with cURL

### Update Example:
```bash
curl -X POST http://127.0.0.1:8000/api/users/1/update \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'
```

### Delete Example:
```bash
curl -X POST http://127.0.0.1:8000/api/users/1/delete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Notes

1. All modification operations now use POST method
2. Action-specific endpoints (e.g., `/update`, `/delete`) make the intent clear
3. This approach works better with some proxy servers and firewalls that block PUT/DELETE
4. RESTful semantics are maintained through URL structure
5. All routes maintain the same permission checks as before
