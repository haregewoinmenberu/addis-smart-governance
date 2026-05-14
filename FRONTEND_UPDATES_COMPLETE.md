# Frontend Updates Complete

## Summary

All frontend API calls have been updated to use POST methods instead of PUT/DELETE to match the backend route changes.

## Files Modified

### ✅ `src/lib/api.ts` - Main API Service File

All API functions have been updated to use the new POST-based endpoints:

#### Generic Functions Updated:
1. **`updateItem()`** - Now uses `POST /{endpoint}/{id}/update`
2. **`deleteItem()`** - Now uses `POST /{endpoint}/{id}/delete`

#### Specific Functions Updated:

**Authentication & Profile:**
- `updateProfile()` - `POST /auth/profile/update` (was PUT /auth/profile)
- `revokeSession()` - `POST /auth/sessions/{id}/revoke` (was DELETE)

**Settings:**
- `updateSettings()` - `POST /settings/update` (was PUT /settings)

**Sub-Cities:**
- `updateSubCity()` - `POST /sub-cities/{id}/update` (via updateItem)
- `deleteSubCity()` - `POST /sub-cities/{id}/delete` (via deleteItem)
- `updateSubCityAdministrator()` - `POST /sub-cities/{id}/administrator/update` (was PUT)

**Users:**
- `updateUser()` - `POST /users/{id}/update` (via updateItem)
- `deleteUser()` - `POST /users/{id}/delete` (via deleteItem)

**Technology Requests:**
- `updateRequest()` - `POST /requests/{id}/update` (via updateItem)
- `deleteRequest()` - `POST /requests/{id}/delete` (via deleteItem)

**Technologies:**
- `updateTechnology()` - `POST /technologies/{id}/update` (via updateItem)
- `deleteTechnology()` - `POST /technologies/{id}/delete` (via deleteItem)

**Workflows:**
- `updateWorkflow()` - `POST /workflows/{id}/update` (via updateItem)
- `deleteWorkflow()` - `POST /workflows/{id}/delete` (via deleteItem)

**Audits:**
- `updateAudit()` - `POST /audits/{id}/update` (via updateItem)
- `deleteAudit()` - `POST /audits/{id}/delete` (via deleteItem)

**Vendors:**
- `updateVendor()` - `POST /vendors/{id}/update` (via updateItem)
- `deleteVendor()` - `POST /vendors/{id}/delete` (via deleteItem)

**Cybersecurity:**
- `updateCybersecurityIssue()` - `POST /cybersecurity/{id}/update` (via updateItem)

**Feasibility Studies:**
- `updateFeasibilityStudy()` - `POST /feasibility-studies/{id}/update` (via updateItem)

**Notifications:**
- `deleteNotification()` - `POST /notifications/{id}/delete` (was DELETE)
- `deleteAllReadNotifications()` - `POST /notifications/read/delete-all` (was DELETE)
- `deleteAllNotifications()` - `POST /notifications/all/clear` (was DELETE)

## Backward Compatibility

The `apiPut` and `apiDelete` helper functions are still available but marked as deprecated:

```typescript
/**
 * @deprecated Use apiPost with /update endpoint instead
 */
export async function apiPut<T>(path: string, body: unknown)

/**
 * @deprecated Use apiPost with /delete endpoint instead
 */
export async function apiDelete<T>(path: string)
```

## How It Works

### Generic Update Pattern
All update operations now use the generic `updateItem()` function which automatically appends `/update` to the endpoint:

```typescript
// Before (internal implementation)
return apiPut(`${endpoint}/${id}`, data);

// After (internal implementation)
return apiPost(`${endpoint}/${id}/update`, data);

// Usage (unchanged)
await updateUser(1, { name: "New Name" });
// Calls: POST /users/1/update
```

### Generic Delete Pattern
All delete operations now use the generic `deleteItem()` function which automatically appends `/delete` to the endpoint:

```typescript
// Before (internal implementation)
return apiDelete(`${endpoint}/${id}`);

// After (internal implementation)
return apiPost(`${endpoint}/${id}/delete`, {});

// Usage (unchanged)
await deleteUser(1);
// Calls: POST /users/1/delete
```

## Testing Checklist

### ✅ Authentication & Profile
- [ ] Login works
- [ ] Logout works
- [ ] Update profile works
- [ ] Change password works
- [ ] Revoke session works

### ✅ Users Management
- [ ] List users
- [ ] Create user
- [ ] Update user
- [ ] Delete user
- [ ] Toggle user active status
- [ ] Reset user password

### ✅ Sub-Cities Management
- [ ] List sub-cities
- [ ] Create sub-city
- [ ] Update sub-city
- [ ] Delete sub-city
- [ ] Activate/deactivate sub-city
- [ ] Update administrator

### ✅ Technology Requests
- [ ] List requests
- [ ] Create request
- [ ] Update request
- [ ] Delete request
- [ ] Submit request
- [ ] Resubmit request

### ✅ Technologies
- [ ] List technologies
- [ ] Create technology
- [ ] Update technology
- [ ] Delete technology

### ✅ Workflows
- [ ] List workflows
- [ ] View workflow instances
- [ ] Approve workflow stage
- [ ] Reject workflow
- [ ] Request revision

### ✅ Audits
- [ ] List audits
- [ ] Create audit
- [ ] Update audit
- [ ] Delete audit

### ✅ Vendors
- [ ] List vendors
- [ ] Create vendor
- [ ] Update vendor
- [ ] Delete vendor
- [ ] Approve vendor

### ✅ Cybersecurity
- [ ] List issues
- [ ] Create issue
- [ ] Update issue

### ✅ Feasibility Studies
- [ ] List studies
- [ ] Create study
- [ ] Update study

### ✅ Notifications
- [ ] List notifications
- [ ] Mark as read/unread
- [ ] Delete notification
- [ ] Delete all read
- [ ] Clear all

### ✅ Settings
- [ ] View settings
- [ ] Update settings

## No Code Changes Required in Components

Because we updated the generic `updateItem()` and `deleteItem()` functions, **all existing component code continues to work without any changes**.

### Example - User Management Component

**Component code (unchanged):**
```typescript
// This code doesn't need to change
const handleUpdate = async () => {
  await updateUser(userId, formData);
};

const handleDelete = async () => {
  await deleteUser(userId);
};
```

**What happens internally:**
```typescript
// updateUser() now calls:
POST /users/1/update

// deleteUser() now calls:
POST /users/1/delete
```

## Benefits

1. **Zero Component Changes** - All existing components work without modification
2. **Centralized Updates** - All changes made in one file (`src/lib/api.ts`)
3. **Type Safety** - TypeScript types remain unchanged
4. **Backward Compatible** - Old functions still exist (deprecated)
5. **Better Compatibility** - POST works everywhere (proxies, firewalls, etc.)

## Verification

To verify the updates are working:

1. **Check Browser Network Tab:**
   - Open DevTools (F12)
   - Go to Network tab
   - Perform an update or delete operation
   - Verify the request shows `POST` method
   - Verify the URL includes `/update` or `/delete`

2. **Check for Errors:**
   - Open Console (F12)
   - Look for any 404 or 405 errors
   - All requests should return 200 or appropriate success codes

3. **Test Each Module:**
   - Go through each section of the app
   - Test create, read, update, delete operations
   - Verify success messages appear
   - Verify data updates correctly

## Example Network Requests

### Update User
```
Method: POST
URL: http://localhost:8000/api/users/1/update
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json
Body:
  {
    "name": "Updated Name",
    "email": "updated@example.com"
  }
```

### Delete User
```
Method: POST
URL: http://localhost:8000/api/users/1/delete
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json
Body: {}
```

### Update Profile
```
Method: POST
URL: http://localhost:8000/api/auth/profile/update
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json
Body:
  {
    "name": "New Name",
    "phone": "+251911234567"
  }
```

## Troubleshooting

### Issue: 404 Not Found

**Cause:** Backend routes not updated or mismatch between frontend and backend

**Solution:**
1. Verify backend routes are updated: `php artisan route:list --path=api`
2. Check the exact endpoint being called in Network tab
3. Ensure backend server is running: `php artisan serve`

### Issue: 405 Method Not Allowed

**Cause:** Backend still expects PUT/DELETE

**Solution:**
1. Verify backend `routes/api.php` has been updated
2. Clear route cache: `php artisan route:clear`
3. Restart Laravel server

### Issue: CORS Errors

**Cause:** CORS configuration might need updating

**Solution:**
1. Check `config/cors.php` allows POST method
2. Verify `allowed_methods` includes `'POST'`
3. Clear config cache: `php artisan config:clear`

### Issue: Validation Errors

**Cause:** Request body format might be incorrect

**Solution:**
1. Check Network tab to see exact request body
2. Verify Content-Type is `application/json`
3. Check backend controller expects correct fields

## Next Steps

1. ✅ **Backend Updated** - All routes converted to POST
2. ✅ **Frontend Updated** - All API calls updated
3. ⚠️ **Testing Required** - Test all CRUD operations
4. ⚠️ **Fix Admin Role** - Run `php artisan user:fix-admin-role` if not done

## Commands to Run

```bash
# Backend - Fix admin role (if not done)
cd backend
php artisan user:fix-admin-role admin@itdb.gov.et

# Backend - Verify routes
php artisan route:list --path=api | findstr "POST"

# Backend - Clear caches
php artisan route:clear
php artisan config:clear
php artisan cache:clear

# Frontend - No commands needed, just test in browser
```

## Success Indicators

✅ All API calls use POST method
✅ Update operations include `/update` in URL
✅ Delete operations include `/delete` in URL
✅ No 404 or 405 errors in console
✅ All CRUD operations work correctly
✅ Success messages appear after operations
✅ Data updates reflect in the UI

## Summary

**Total Functions Updated:** 20+
**Files Modified:** 1 (`src/lib/api.ts`)
**Component Changes Required:** 0
**Breaking Changes:** None (backward compatible)
**Testing Required:** Yes (all CRUD operations)

The frontend is now fully updated and ready to work with the new POST-based backend API routes!
