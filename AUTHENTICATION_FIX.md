# Authentication Persistence Fix

## Problem
Users were being logged out every time they refreshed the page, even though the authentication token was stored in localStorage.

## Root Cause
The issue was caused by the route guards (`beforeLoad`) checking for tokens synchronously before the `AuthContext` could finish loading and validating the token. This created a race condition where:

1. Page loads → Route guard checks for token
2. Token exists in localStorage → Route allows access
3. AuthContext starts fetching user data from `/auth/me`
4. If `/auth/me` returns 401 → Token gets cleared
5. Route guard runs again → No token found → Redirect to login

## Solution

### 1. Removed Synchronous Route Guards
Removed all `beforeLoad` checks that were checking for tokens before the AuthContext loaded.

**Before:**
```typescript
beforeLoad: async () => {
  const token = getAuthToken();
  if (!token) {
    throw redirect({ to: "/login" });
  }
}
```

**After:**
```typescript
// No beforeLoad check
```

### 2. Created `RequireAuth` Component
Created a new component that waits for the AuthContext to finish loading before checking authentication.

**File:** `src/components/auth/RequireAuth.tsx`

**Features:**
- Shows loading spinner while authentication is being checked
- Only redirects after confirming user is not authenticated
- Prevents redirect loops by checking current pathname
- Waits for AuthContext to finish loading

**Usage:**
```typescript
component: () => (
  <RequireAuth>
    <Page />
  </RequireAuth>
)
```

### 3. Updated AuthContext
**File:** `src/contexts/AuthContext.tsx`

**Changes:**
- Added `isAuthenticated` state separate from user data
- Added `logout()` function for proper logout
- Improved error handling to only clear token on confirmed 401 errors
- Keep users authenticated even if `/auth/me` fails due to network issues
- Don't redirect from AuthContext - let RequireAuth handle it

### 4. Fixed Login Redirect Loop
**File:** `src/routes/login.tsx`

**Changes:**
- Added search parameter validation to handle redirect URLs
- Filter out `/login` from redirect paths to prevent loops
- Redirect authenticated users away from login page
- Show loading state while checking authentication

**Before:**
```
/login?redirect=/login (infinite loop)
```

**After:**
```
/login → successful login → / (home page)
```

### 5. Removed Logout Confirmation
**File:** `src/components/layout/Sidebar.tsx`

**Changes:**
- Removed confirmation dialog from logout button
- Direct logout on click

## Updated Files

1. `src/contexts/AuthContext.tsx` - Enhanced authentication state management
2. `src/components/auth/RequireAuth.tsx` - New authentication guard component
3. `src/components/layout/Sidebar.tsx` - Added logout button, removed confirmation
4. `src/routes/login.tsx` - Fixed redirect loop, added auth check
5. `src/routes/index.tsx` - Uses RequireAuth instead of beforeLoad
6. `src/routes/requests.tsx` - Uses RequireAuth instead of beforeLoad
7. `src/routes/requests.create.tsx` - Uses RequireAuth instead of beforeLoad
8. `src/routes/requests.$id.edit.tsx` - Uses RequireAuth instead of beforeLoad
9. `src/routes/registry.tsx` - Uses RequireAuth instead of beforeLoad
10. `src/routes/registry.create.tsx` - Uses RequireAuth instead of beforeLoad
11. `src/routes/registry.$id.edit.tsx` - Uses RequireAuth instead of beforeLoad
12. `src/lib/api.ts` - Don't clear token on /auth/me failures

## Authentication Flow

### On Page Load:
1. AuthContext starts loading
2. Checks for token in localStorage
3. If token exists, calls `/auth/me` to validate
4. Sets `isAuthenticated` based on response
5. RequireAuth waits for loading to complete
6. If authenticated → Render page
7. If not authenticated → Redirect to login

### On Login:
1. User submits credentials
2. Backend returns token
3. Token saved to localStorage
4. Navigate to redirect path or home
5. AuthContext fetches user data
6. Page renders

### On Logout:
1. User clicks logout button
2. Token cleared from localStorage
3. User state cleared
4. Redirect to login page

### On Refresh:
1. Token persists in localStorage
2. AuthContext validates token
3. If valid → User stays logged in
4. If invalid → Redirect to login

## Benefits

1. **Persistent Authentication** - Users stay logged in across page refreshes
2. **No Race Conditions** - Proper async handling of authentication checks
3. **Better UX** - Loading states instead of instant redirects
4. **No Redirect Loops** - Proper handling of redirect parameters
5. **Graceful Error Handling** - Network errors don't log users out
6. **Clean Logout** - Simple, direct logout without confirmation

## Testing

To test the fix:

1. **Login Persistence:**
   - Login to the application
   - Refresh the page
   - ✅ Should stay logged in

2. **Logout:**
   - Click logout button in sidebar
   - ✅ Should redirect to login immediately

3. **Login Redirect:**
   - Try to access protected page while logged out
   - ✅ Should redirect to login with redirect parameter
   - Login successfully
   - ✅ Should redirect back to original page

4. **Already Authenticated:**
   - While logged in, navigate to `/login`
   - ✅ Should redirect to home page

## Notes

- All protected routes now use `RequireAuth` wrapper
- Login page checks authentication and redirects if already logged in
- Token validation happens asynchronously in AuthContext
- Only confirmed 401 errors clear the authentication token
