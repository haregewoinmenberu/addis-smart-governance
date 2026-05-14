# Navigation & Authentication Visual Guide

## Sidebar Navigation - Before & After

### Before (Original)
```
┌─────────────────────────────┐
│  STRP Portal                │
│  Addis Ababa ITDB           │
├─────────────────────────────┤
│  📊 Dashboard               │
│  📄 Technology Requests     │
│  📋 Duplication Analysis    │
│  ✓  Feasibility Studies     │
│  💾 Technology Registry     │
│  🛡️  Audit & Compliance     │
│  🔒 Cybersecurity           │
│  🏢 Vendor Management       │
│  🔀 Approval Workflows      │
│  📈 Reports & Analytics     │
│  💬 Surveys & Feedback      │
│  🔔 Notifications           │
│  👥 User Management         │
│  ⚙️  Settings               │
└─────────────────────────────┘
```

### After (Updated) - ITDB Administrator View
```
┌─────────────────────────────┐
│  STRP Portal                │
│  Addis Ababa ITDB           │
├─────────────────────────────┤
│  📊 Dashboard               │
│  📄 Technology Requests     │
│  📋 Duplication Analysis    │
│  ✓  Feasibility Studies     │
│  💾 Technology Registry     │
│  🛡️  Audit & Compliance     │
│  🔒 Cybersecurity           │
│  🏢 Vendor Management       │
│  🔀 Approval Workflows      │
│  📈 Reports & Analytics     │
│  💬 Surveys & Feedback      │
│  🔔 Notifications           │
│  🏛️  Sub-Cities ⭐ NEW      │
│  👥 User Management         │
│  ⚙️  Settings               │
└─────────────────────────────┘
```

### After (Updated) - Sub-City Administrator View
```
┌─────────────────────────────┐
│  STRP Portal                │
│  Addis Ababa ITDB           │
├─────────────────────────────┤
│  📊 Dashboard               │
│  📄 Technology Requests     │
│  📋 Duplication Analysis    │
│  ✓  Feasibility Studies     │
│  💾 Technology Registry     │
│  🛡️  Audit & Compliance     │
│  🔒 Cybersecurity           │
│  🏢 Vendor Management       │
│  🔀 Approval Workflows      │
│  📈 Reports & Analytics     │
│  💬 Surveys & Feedback      │
│  🔔 Notifications           │
│  ❌ Sub-Cities (HIDDEN)     │
│  👥 User Management         │
│  ⚙️  Settings               │
└─────────────────────────────┘
```

---

## Authentication Flow Diagram

### Scenario 1: Accessing Dashboard (Authenticated)
```
┌──────────────┐
│   User       │
│  (Logged In) │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  Navigate to "/"     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  beforeLoad Guard    │
│  Check Token         │
└──────┬───────────────┘
       │
       ▼ Token Valid
┌──────────────────────┐
│  Load Dashboard      │
│  Show Data           │
└──────────────────────┘
```

### Scenario 2: Accessing Dashboard (Not Authenticated)
```
┌──────────────┐
│   User       │
│ (Not Logged) │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  Navigate to "/"     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  beforeLoad Guard    │
│  Check Token         │
└──────┬───────────────┘
       │
       ▼ No Token
┌──────────────────────┐
│  Redirect to Login   │
│  Save redirect="/"   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Login Page          │
│  Enter Credentials   │
└──────┬───────────────┘
       │
       ▼ Login Success
┌──────────────────────┐
│  Redirect to "/"     │
│  Load Dashboard      │
└──────────────────────┘
```

### Scenario 3: Accessing Sub-Cities (ITDB Admin)
```
┌──────────────┐
│  ITDB Admin  │
│  (Logged In) │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  See "Sub-Cities"    │
│  in Sidebar          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Click Sub-Cities    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  beforeLoad Guard    │
│  Check Token         │
└──────┬───────────────┘
       │
       ▼ Token Valid
┌──────────────────────┐
│  Load Sub-Cities     │
│  Show All Sub-Cities │
└──────────────────────┘
```

### Scenario 4: Accessing Sub-Cities (Sub-City Admin)
```
┌──────────────┐
│ Sub-City Adm │
│  (Logged In) │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  "Sub-Cities" Menu   │
│  NOT VISIBLE         │
└──────────────────────┘
       │
       │ (If tries direct URL)
       ▼
┌──────────────────────┐
│  Navigate to         │
│  /sub-cities         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  beforeLoad Guard    │
│  Check Token         │
└──────┬───────────────┘
       │
       ▼ Token Valid
┌──────────────────────┐
│  Load Page           │
│  (Backend may 403)   │
└──────────────────────┘
```

---

## Role-Based Menu Visibility

### ITDB Administrator
```
✅ Dashboard
✅ Technology Requests
✅ Duplication Analysis
✅ Feasibility Studies
✅ Technology Registry
✅ Audit & Compliance
✅ Cybersecurity
✅ Vendor Management
✅ Approval Workflows
✅ Reports & Analytics
✅ Surveys & Feedback
✅ Notifications
✅ Sub-Cities ⭐
✅ User Management
✅ Settings
```

### Sub-City Administrator
```
✅ Dashboard
✅ Technology Requests
✅ Duplication Analysis
✅ Feasibility Studies
✅ Technology Registry
✅ Audit & Compliance
✅ Cybersecurity
✅ Vendor Management
✅ Approval Workflows
✅ Reports & Analytics
✅ Surveys & Feedback
✅ Notifications
❌ Sub-Cities (HIDDEN)
✅ User Management
✅ Settings
```

### Sub-City User
```
✅ Dashboard
✅ Technology Requests
✅ Duplication Analysis
✅ Feasibility Studies
✅ Technology Registry
✅ Audit & Compliance
✅ Cybersecurity
✅ Vendor Management
✅ Approval Workflows
✅ Reports & Analytics
✅ Surveys & Feedback
✅ Notifications
❌ Sub-Cities (HIDDEN)
⚠️  User Management (Limited)
✅ Settings
```

---

## Page Layout Structure

### Before (Sub-Cities Page)
```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Sub-Cities Management                          │
│  (No Sidebar, No Topbar)                        │
│                                                 │
│  [Content directly on page]                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### After (Sub-Cities Page)
```
┌──────────┬──────────────────────────────────────┐
│          │  Topbar                              │
│          │  [User Profile] [Notifications]      │
│ Sidebar  ├──────────────────────────────────────┤
│          │                                      │
│ [Nav]    │  Sub-Cities Management               │
│          │                                      │
│ [Items]  │  [Statistics Cards]                  │
│          │                                      │
│          │  [Search & Filters]                  │
│          │                                      │
│          │  [Sub-Cities Table]                  │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

---

## User Journey Map

### ITDB Administrator Journey
```
1. Login
   ↓
2. Dashboard (sees all data)
   ↓
3. Clicks "Sub-Cities" in sidebar
   ↓
4. Views all sub-cities
   ↓
5. Can register new sub-cities
   ↓
6. Can activate/deactivate sub-cities
   ↓
7. Can view statistics for each sub-city
```

### Sub-City Administrator Journey
```
1. Login
   ↓
2. Dashboard (sees only own sub-city data)
   ↓
3. Does NOT see "Sub-Cities" in sidebar
   ↓
4. Can manage own sub-city users
   ↓
5. Can submit technology requests
   ↓
6. Can view own sub-city reports
```

---

## Authentication States

### State 1: Not Authenticated
```
┌─────────────────────────────────────┐
│  User State: Not Logged In          │
├─────────────────────────────────────┤
│  Token: None                        │
│  User Object: null                  │
│  Accessible Routes:                 │
│    ✅ /login                        │
│    ✅ /forgot-password              │
│    ❌ / (redirects to /login)       │
│    ❌ /sub-cities (redirects)       │
│    ❌ All other routes (redirects)  │
└─────────────────────────────────────┘
```

### State 2: Authenticated as ITDB Admin
```
┌─────────────────────────────────────┐
│  User State: Logged In              │
├─────────────────────────────────────┤
│  Token: Valid Bearer Token          │
│  User Object: {                     │
│    roles: ['itdb_administrator']    │
│    permissions: [...]               │
│  }                                  │
│  Accessible Routes:                 │
│    ✅ All routes                    │
│    ✅ /sub-cities (visible in nav)  │
│  Sidebar:                           │
│    ✅ Shows "Sub-Cities" menu       │
└─────────────────────────────────────┘
```

### State 3: Authenticated as Sub-City Admin
```
┌─────────────────────────────────────┐
│  User State: Logged In              │
├─────────────────────────────────────┤
│  Token: Valid Bearer Token          │
│  User Object: {                     │
│    roles: ['sub_city_admin']        │
│    sub_city_id: 5                   │
│    permissions: [...]               │
│  }                                  │
│  Accessible Routes:                 │
│    ✅ Most routes (scoped to own)   │
│    ❌ /sub-cities (hidden in nav)   │
│  Sidebar:                           │
│    ❌ Hides "Sub-Cities" menu       │
│  Data Scope:                        │
│    🔒 Only own sub-city data        │
└─────────────────────────────────────┘
```

---

## Code Flow Visualization

### Sidebar Component Logic
```
┌─────────────────────────────────────┐
│  Sidebar Component Renders          │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  useAuth() Hook                     │
│  Fetches current user               │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Check User Roles                   │
│  isITDBAdmin = user.roles.some(...) │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Map Through Navigation Items       │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  For Each Item:                     │
│  if (item.adminOnly && !isITDBAdmin)│
│    return null; // Hide item        │
│  else                               │
│    render item; // Show item        │
└─────────────────────────────────────┘
```

### Route Protection Logic
```
┌─────────────────────────────────────┐
│  User Navigates to Protected Route  │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  beforeLoad() Hook Executes         │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  getAuthToken()                     │
│  Check localStorage for token       │
└─────────────┬───────────────────────┘
              │
         ┌────┴────┐
         │         │
    Token Exists   No Token
         │         │
         ▼         ▼
    ┌────────┐  ┌──────────────────┐
    │ Allow  │  │ throw redirect({ │
    │ Access │  │   to: "/login",  │
    └────────┘  │   search: {...}  │
                │ })               │
                └──────────────────┘
```

---

## Testing Scenarios

### Test 1: ITDB Admin Login
```
1. Open browser
2. Navigate to http://localhost:3000/
3. Should redirect to /login
4. Enter ITDB admin credentials
5. Should redirect back to /
6. Check sidebar - "Sub-Cities" should be visible
7. Click "Sub-Cities"
8. Should load sub-cities management page
✅ PASS
```

### Test 2: Sub-City Admin Login
```
1. Open browser
2. Navigate to http://localhost:3000/
3. Should redirect to /login
4. Enter sub-city admin credentials
5. Should redirect back to /
6. Check sidebar - "Sub-Cities" should NOT be visible
7. Try direct URL: /sub-cities
8. Should load but may show 403 or empty data
✅ PASS
```

### Test 3: Unauthenticated Access
```
1. Open browser (incognito mode)
2. Navigate to http://localhost:3000/
3. Should redirect to /login
4. Navigate to http://localhost:3000/sub-cities
5. Should redirect to /login
6. Login page should show
✅ PASS
```

---

## Summary

### What Changed
✅ Added "Sub-Cities" to sidebar navigation  
✅ Made it visible only to ITDB administrators  
✅ Added authentication guards to dashboard  
✅ Added authentication guards to sub-cities page  
✅ Wrapped sub-cities page in AppShell layout  
✅ Implemented role-based menu filtering  

### What Stayed the Same
✅ All other navigation items unchanged  
✅ Existing authentication system unchanged  
✅ User roles and permissions unchanged  
✅ API endpoints unchanged  

### User Impact
✅ ITDB admins see new "Sub-Cities" menu  
✅ Sub-city admins don't see the menu  
✅ All users must be authenticated to access dashboard  
✅ Consistent layout across all pages  

---

**Visual Guide Complete** ✅
