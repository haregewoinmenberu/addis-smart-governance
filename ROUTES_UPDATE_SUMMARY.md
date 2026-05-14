# Routes Update Summary

## What Was Changed

All PUT and DELETE HTTP methods in the API routes have been converted to POST methods with specific action endpoints.

## Changes Made

### 1. Backend Routes (`backend/routes/api.php`)

#### PUT → POST with `/update` suffix
- `PUT /auth/profile` → `POST /auth/profile/update`
- `PUT /settings` → `POST /settings/update`
- `PUT /settings/{key}` → `POST /settings/{key}/update`
- `PUT /roles/{role}/permissions` → `POST /roles/{role}/permissions/update`
- `PUT /sub-cities/{id}` → `POST /sub-cities/{id}/update`
- `PUT /sub-cities/{id}/administrator` → `POST /sub-cities/{id}/administrator/update`
- `PUT /users/{id}` → `POST /users/{id}/update`
- `PUT /requests/{id}` → `POST /requests/{id}/update`
- `PUT /technologies/{id}` → `POST /technologies/{id}/update`
- `PUT /workflows/{id}` → `POST /workflows/{id}/update`
- `PUT /audits/{id}` → `POST /audits/{id}/update`
- `PUT /vendors/{id}` → `POST /vendors/{id}/update`
- `PUT /cybersecurity/{id}` → `POST /cybersecurity/{id}/update`
- `PUT /feasibility-studies/{id}` → `POST /feasibility-studies/{id}/update`

#### DELETE → POST with `/delete` suffix
- `DELETE /auth/sessions/{id}` → `POST /auth/sessions/{id}/revoke`
- `DELETE /sub-cities/{id}` → `POST /sub-cities/{id}/delete`
- `DELETE /users/{id}` → `POST /users/{id}/delete`
- `DELETE /requests/{id}` → `POST /requests/{id}/delete`
- `DELETE /technologies/{id}` → `POST /technologies/{id}/delete`
- `DELETE /workflows/{id}` → `POST /workflows/{id}/delete`
- `DELETE /audits/{id}` → `POST /audits/{id}/delete`
- `DELETE /vendors/{id}` → `POST /vendors/{id}/delete`
- `DELETE /duplications/{id}` → `POST /duplications/{id}/delete`
- `DELETE /feasibility-studies/{id}` → `POST /feasibility-studies/{id}/delete`
- `DELETE /notifications/{id}` → `POST /notifications/{id}/delete`
- `DELETE /notifications/read/all` → `POST /notifications/read/delete-all`
- `DELETE /notifications/all/clear` → `POST /notifications/all/clear`

## Why This Change?

1. **Compatibility**: Some proxy servers and firewalls block PUT/DELETE methods
2. **Simplicity**: POST is universally supported
3. **Clarity**: Action-specific endpoints (e.g., `/update`, `/delete`) make intent explicit
4. **Consistency**: All modification operations use the same HTTP method

## What You Need to Do

### Backend
✅ **Already Done** - All routes have been updated in `backend/routes/api.php`

### Frontend
⚠️ **Action Required** - You need to update all API calls in the frontend

## Frontend Update Guide

### Step 1: Find All API Calls

Search for these patterns in your frontend code:
- `.put(`
- `.delete(`
- `method: 'PUT'`
- `method: 'DELETE'`

### Step 2: Update API Calls

#### Example 1: Update User
**Before:**
```typescript
await api.put(`/users/${id}`, data);
```

**After:**
```typescript
await api.post(`/users/${id}/update`, data);
```

#### Example 2: Delete User
**Before:**
```typescript
await api.delete(`/users/${id}`);
```

**After:**
```typescript
await api.post(`/users/${id}/delete`);
```

#### Example 3: Update Profile
**Before:**
```typescript
await api.put('/auth/profile', data);
```

**After:**
```typescript
await api.post('/auth/profile/update', data);
```

### Step 3: Update API Service Files

If you have a centralized API service file (e.g., `src/lib/api.ts` or `src/services/api.ts`), update all the methods there.

Common files to check:
- `src/lib/api.ts`
- `src/services/*.ts`
- `src/hooks/use*.ts`
- `src/routes/*.tsx`

### Step 4: Test All Functionality

After updating, test:
- ✓ User management (create, update, delete)
- ✓ Sub-city management
- ✓ Technology requests
- ✓ Workflows
- ✓ Settings
- ✓ Profile updates
- ✓ All other CRUD operations

## Quick Reference Table

| Old Method | Old Endpoint | New Method | New Endpoint |
|------------|--------------|------------|--------------|
| PUT | `/users/{id}` | POST | `/users/{id}/update` |
| DELETE | `/users/{id}` | POST | `/users/{id}/delete` |
| PUT | `/sub-cities/{id}` | POST | `/sub-cities/{id}/update` |
| DELETE | `/sub-cities/{id}` | POST | `/sub-cities/{id}/delete` |
| PUT | `/requests/{id}` | POST | `/requests/{id}/update` |
| DELETE | `/requests/{id}` | POST | `/requests/{id}/delete` |
| PUT | `/technologies/{id}` | POST | `/technologies/{id}/update` |
| DELETE | `/technologies/{id}` | POST | `/technologies/{id}/delete` |
| PUT | `/workflows/{id}` | POST | `/workflows/{id}/update` |
| DELETE | `/workflows/{id}` | POST | `/workflows/{id}/delete` |
| PUT | `/audits/{id}` | POST | `/audits/{id}/update` |
| DELETE | `/audits/{id}` | POST | `/audits/{id}/delete` |
| PUT | `/vendors/{id}` | POST | `/vendors/{id}/update` |
| DELETE | `/vendors/{id}` | POST | `/vendors/{id}/delete` |
| PUT | `/settings` | POST | `/settings/update` |
| PUT | `/auth/profile` | POST | `/auth/profile/update` |

## Testing the Backend

Test the updated routes with cURL:

```bash
# Update user
curl -X POST http://127.0.0.1:8000/api/users/1/update \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'

# Delete user
curl -X POST http://127.0.0.1:8000/api/users/1/delete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Files Modified

### Backend:
- ✅ `backend/routes/api.php` - All routes updated

### Documentation Created:
- ✅ `API_ROUTES_UPDATED.md` - Complete API documentation
- ✅ `ROUTES_UPDATE_SUMMARY.md` - This file

### Frontend (Needs Update):
- ⚠️ All API service files
- ⚠️ All components making API calls
- ⚠️ All hooks using API calls

## Next Steps

1. **Fix Admin Role Issue First** (if not done):
   ```bash
   cd backend
   php artisan user:fix-admin-role admin@itdb.gov.et
   ```

2. **Update Frontend API Calls**:
   - Search for `.put(` and `.delete(` in frontend code
   - Replace with `.post(` and updated endpoints
   - Test each updated endpoint

3. **Test Everything**:
   - Login/logout
   - CRUD operations
   - Workflow approvals
   - Settings updates

## Support

If you encounter issues:
1. Check Laravel logs: `backend/storage/logs/laravel.log`
2. Check browser console for errors
3. Verify the route exists: `php artisan route:list | grep "api/"`
4. Test with cURL to isolate frontend vs backend issues

## Rollback (If Needed)

If you need to rollback, the routes file is in version control. You can:
```bash
cd backend
git checkout routes/api.php
```

But note: The new POST-based approach is recommended for better compatibility.
