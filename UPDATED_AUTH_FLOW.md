# Updated Authentication Flow

## Overview
The authentication flow has been updated to automatically redirect logged-in users to the dashboard when they visit the landing page, and redirect logged-out users back to the landing page.

## Changes Made

### 1. Landing Page (`src/routes/index.tsx`)
**Added authentication check:**
- Now checks if user is authenticated when visiting `/`
- If user is logged in → Auto-redirect to `/dashboard`
- If user is logged out → Show landing page
- Shows loading spinner while checking authentication status

### 2. Logout Function (`src/contexts/AuthContext.tsx`)
**Updated redirect destination:**
- Changed from redirecting to `/login`
- Now redirects to `/` (landing page)
- Clears authentication token and user state

## New User Flow

### Scenario 1: Logged-In User Visits Root
```
1. User visits http://localhost:3000/
2. Landing page checks authentication status
3. User is authenticated ✓
4. Auto-redirect to /dashboard
5. Dashboard displays

Result: Logged-in users go straight to dashboard
```

### Scenario 2: Logged-Out User Visits Root
```
1. User visits http://localhost:3000/
2. Landing page checks authentication status
3. User is NOT authenticated
4. Landing page displays normally

Result: Logged-out users see marketing content
```

### Scenario 3: User Clicks Login from Landing Page
```
1. User on landing page (/)
2. User clicks "Login" button
3. Navigate to /login
4. User enters credentials
5. Submit and authenticate
6. Redirect to /dashboard

Result: Users can explicitly login when needed
```

### Scenario 4: User Logs Out
```
1. User is on /dashboard or any protected route
2. User clicks "Log out" in sidebar
3. Authentication cleared
4. Auto-redirect to / (landing page)
5. Landing page displays

Result: Logged-out users return to landing page
```

### Scenario 5: Logged-Out User Tries Protected Route
```
1. User (not logged in) visits /dashboard
2. RequireAuth detects no authentication
3. Redirect to /login?redirect=/dashboard
4. User logs in
5. Redirect back to /dashboard

Result: Protected routes remain secure
```

### Scenario 6: Logged-In User Visits Login Page
```
1. User (already logged in) visits /login
2. Login page detects authentication
3. Auto-redirect to /dashboard

Result: No need to login again if already authenticated
```

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Visits Domain (/)                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Check Authentication │
                └──────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          │                                  │
          ▼                                  ▼
    ┌──────────┐                      ┌──────────┐
    │ Logged In│                      │Logged Out│
    └──────────┘                      └──────────┘
          │                                  │
          ▼                                  ▼
  ┌───────────────┐                 ┌───────────────┐
  │ Redirect to   │                 │ Show Landing  │
  │  /dashboard   │                 │     Page      │
  └───────────────┘                 └───────────────┘
          │                                  │
          ▼                                  │
  ┌───────────────┐                         │
  │   Dashboard   │                         │
  │   Protected   │                         │
  │    Routes     │                         │
  └───────────────┘                         │
          │                                  │
          │                                  ▼
          │                         ┌───────────────┐
          │                         │ Click "Login" │
          │                         │    Button     │
          │                         └───────────────┘
          │                                  │
          │                                  ▼
          │                         ┌───────────────┐
          │                         │  /login Page  │
          │                         └───────────────┘
          │                                  │
          │                                  ▼
          │                         ┌───────────────┐
          │                         │   Authenticate│
          │                         └───────────────┘
          │                                  │
          └──────────────────────────────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │   Dashboard    │
                  └────────────────┘
                           │
                           │ User clicks "Log out"
                           ▼
                  ┌────────────────┐
                  │ Clear Auth     │
                  │ Redirect to /  │
                  └────────────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ Landing Page   │
                  └────────────────┘
```

## Code Changes

### `src/routes/index.tsx`

**Before:**
```tsx
function Index() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      {/* ... other components */}
    </main>
  );
}
```

**After:**
```tsx
function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log("User is authenticated, redirecting to dashboard");
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Don't render landing page if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  // Show landing page for unauthenticated users
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      {/* ... other components */}
    </main>
  );
}
```

### `src/contexts/AuthContext.tsx`

**Before:**
```tsx
const logout = useCallback(() => {
  clearAuthToken();
  setUser(null);
  setIsAuthenticated(false);
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}, []);
```

**After:**
```tsx
const logout = useCallback(() => {
  clearAuthToken();
  setUser(null);
  setIsAuthenticated(false);
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}, []);
```

## Benefits

### 1. Better User Experience
- ✅ Logged-in users don't see marketing content
- ✅ Direct access to dashboard for authenticated users
- ✅ Smooth logout experience back to landing page
- ✅ No unnecessary page views

### 2. Security
- ✅ Protected routes remain secure
- ✅ Authentication checked before showing content
- ✅ Proper redirect chain maintained
- ✅ Token validation works correctly

### 3. Marketing & Conversion
- ✅ Landing page shown only to potential new users
- ✅ Clear path from landing → login → dashboard
- ✅ Logged-out users see full marketing message
- ✅ Call-to-action buttons work as expected

## Testing Scenarios

### Test 1: Fresh Visitor
```bash
# Clear browser data/cookies
# Visit http://localhost:3000/

Expected:
✓ Landing page displays
✓ Can see all marketing content
✓ "Login" button visible in navbar
✓ Can click login to go to /login
```

### Test 2: Existing Session
```bash
# Already logged in
# Visit http://localhost:3000/

Expected:
✓ Brief loading spinner (if any)
✓ Auto-redirect to /dashboard
✓ Dashboard displays
✓ Can use all protected features
```

### Test 3: Login Process
```bash
# Start at landing page (/)
# Click "Login" button
# Enter credentials and submit

Expected:
✓ Navigate to /login
✓ Form displays
✓ After successful login, redirect to /dashboard
✓ Dashboard displays normally
```

### Test 4: Logout Process
```bash
# Start at /dashboard (logged in)
# Click "Log out" in sidebar

Expected:
✓ Authentication cleared
✓ Redirect to / (landing page)
✓ Landing page displays
✓ Can login again if needed
```

### Test 5: Direct Dashboard Access (Not Logged In)
```bash
# Not logged in
# Visit http://localhost:3000/dashboard

Expected:
✓ RequireAuth detects no authentication
✓ Redirect to /login?redirect=/dashboard
✓ After login, return to /dashboard
```

### Test 6: Direct Login Access (Already Logged In)
```bash
# Already logged in
# Visit http://localhost:3000/login

Expected:
✓ Login page detects authentication
✓ Auto-redirect to /dashboard
✓ Don't show login form
```

## Edge Cases Handled

### Case 1: Slow Network
```
- Shows loading spinner while checking auth
- Prevents flash of landing page content
- Smooth transition to dashboard
```

### Case 2: Expired Token
```
- Token validation fails
- User treated as logged out
- Shows landing page
- Can login again normally
```

### Case 3: Browser Back Button
```
- After logout, pressing back shows landing page
- After login, pressing back doesn't break auth
- Navigation history maintained correctly
```

### Case 4: Multiple Tabs
```
- Logout in one tab affects all tabs
- Login in one tab affects all tabs
- Consistent authentication state
```

## Configuration

### Environment Variables
```env
# Backend API URL
VITE_API_URL=http://localhost:8000/api
```

### Route Configuration
```tsx
// Public routes (no auth required)
/                    # Landing page with auto-redirect
/login              # Login page with auth check
/forgot-password    # Password recovery

// Protected routes (auth required)
/dashboard          # Executive dashboard
/requests           # Technology requests
/registry           # Technology registry
// ... all other authenticated routes
```

## Troubleshooting

### Issue: Infinite redirect loop
**Cause:** Auth state not updating properly
**Solution:** Clear browser cache, check token validation

### Issue: Landing page flashes before redirect
**Cause:** Slow auth check
**Solution:** Loading state should prevent this, check if it's rendering

### Issue: Logout doesn't redirect
**Cause:** Window location not updating
**Solution:** Check browser console, verify `window.location.href` works

### Issue: Can't access dashboard after login
**Cause:** Token not stored or invalid
**Solution:** Check network tab, verify token in localStorage

## Summary

The updated authentication flow provides:
- ✅ Smart routing based on authentication state
- ✅ Better user experience for both logged-in and logged-out users
- ✅ Secure protected routes
- ✅ Clear navigation paths
- ✅ Proper logout experience

**Key Behaviors:**
1. **Root (/) visits** → Check auth → Redirect to dashboard if logged in
2. **Logout** → Clear auth → Redirect to landing page (/)
3. **Login button** → Explicit navigation to /login
4. **Protected routes** → Secure with RequireAuth guard

This creates a natural flow where:
- Marketing content is shown to potential users
- Authenticated users go straight to their dashboard
- Logout returns users to the public landing page
- Login process works seamlessly
