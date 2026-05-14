# Sub-City Multi-Tenant System Architecture

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                    ADDIS ABABA SMART GOVERNANCE PORTAL                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌───────────────────────┐       ┌───────────────────────┐
        │   ITDB Administrator  │       │  Sub-City Users       │
        │   (Super Admin)       │       │  (Multi-Tenant)       │
        └───────────────────────┘       └───────────────────────┘
                    │                               │
                    │ Full Access                   │ Scoped Access
                    │                               │
                    ▼                               ▼
        ┌───────────────────────────────────────────────────────┐
        │                                                       │
        │              SUB-CITY REGISTRY                        │
        │                                                       │
        │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
        │  │ Bole SC  │  │ Arada SC │  │ Kirkos SC│  ...      │
        │  │  (BSC)   │  │  (ASC)   │  │  (KSC)   │           │
        │  └──────────┘  └──────────┘  └──────────┘           │
        │                                                       │
        └───────────────────────────────────────────────────────┘
                    │           │           │
                    │           │           │
        ┌───────────┘           │           └───────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│  Bole SC     │        │  Arada SC    │        │  Kirkos SC   │
│  Tenant      │        │  Tenant      │        │  Tenant      │
├──────────────┤        ├──────────────┤        ├──────────────┤
│ • Admin      │        │ • Admin      │        │ • Admin      │
│ • Users      │        │ • Users      │        │ • Users      │
│ • Tech       │        │ • Tech       │        │ • Tech       │
│ • Requests   │        │ • Requests   │        │ • Requests   │
│ • Reports    │        │ • Reports    │        │ • Reports    │
└──────────────┘        └──────────────┘        └──────────────┘
     ▲                       ▲                       ▲
     │                       │                       │
     └───────────────────────┴───────────────────────┘
                             │
                    Data Isolation Layer
                    (SubCityScope Middleware)
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Sub-Cities   │  │  Dashboard   │  │  Users       │        │
│  │ Management   │  │              │  │  Management  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ HTTP/REST API
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (Laravel)                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Middleware Layer                       │  │
│  │  • Authentication (Passport)                             │  │
│  │  • SubCityScope (Data Isolation)                         │  │
│  │  • Permission Checks                                     │  │
│  │  • Activity Logging                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                   │
│                             ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Controller Layer                        │  │
│  │  • SubCityController                                     │  │
│  │  • UserController                                        │  │
│  │  • TechnologyController                                  │  │
│  │  • RequestController                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                   │
│                             ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Model Layer                           │  │
│  │  • SubCity (with relationships)                          │  │
│  │  • User (with sub_city_id)                               │  │
│  │  • Technology (with sub_city_id)                         │  │
│  │  • RequestItem (with sub_city_id)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database (MySQL)                           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ sub_cities   │  │    users     │  │ technologies │        │
│  │              │  │              │  │              │        │
│  │ • id         │  │ • id         │  │ • id         │        │
│  │ • name       │  │ • name       │  │ • name       │        │
│  │ • code       │  │ • email      │  │ • type       │        │
│  │ • admin_*    │  │ • sub_city_id│  │ • sub_city_id│        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│         │                  │                  │                │
│         └──────────────────┴──────────────────┘                │
│                    Foreign Key Relationships                    │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication & Authorization Flow

```
┌─────────────┐
│   User      │
│   Login     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  1. Authenticate Credentials        │
│     (Email + Password)              │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  2. Load User with Relations        │
│     • Roles                         │
│     • Permissions                   │
│     • SubCity                       │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  3. Generate Access Token           │
│     (Laravel Passport)              │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  4. Return User Context             │
│     • User details                  │
│     • Sub-city details              │
│     • Roles & permissions           │
│     • Access token                  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  5. Store in Frontend State         │
│     (React Context/Query)           │
└─────────────────────────────────────┘
```

## Request Processing Flow

```
┌─────────────────────────────────────────────────────────────┐
│  User makes API request                                     │
│  GET /api/technologies                                      │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  Middleware: Authentication                                 │
│  • Verify Bearer token                                      │
│  • Load authenticated user                                  │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  Middleware: SubCityScope                                   │
│  • Check user role                                          │
│  • If sub-city user: Add sub_city_id filter                 │
│  • If ITDB admin: Skip filtering                            │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  Middleware: Permission Check                               │
│  • Verify user has required permission                      │
│  • Return 403 if unauthorized                               │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  Controller: Process Request                                │
│  • Apply scoped filters                                     │
│  • Execute business logic                                   │
│  • Return response                                          │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  Middleware: Activity Logging                               │
│  • Log action to activity_logs table                        │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  Return JSON Response                                       │
│  • Data (filtered by sub-city if applicable)                │
│  • Metadata (pagination, etc.)                              │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema Relationships

```
┌──────────────────────┐
│     sub_cities       │
│──────────────────────│
│ id (PK)              │
│ name                 │
│ code                 │
│ admin_name           │
│ admin_email          │
│ is_active            │
│ ...                  │
└──────────┬───────────┘
           │
           │ 1:N
           │
           ▼
┌──────────────────────┐
│       users          │
│──────────────────────│
│ id (PK)              │
│ name                 │
│ email                │
│ sub_city_id (FK) ────┘
│ ...                  │
└──────────┬───────────┘
           │
           │ 1:N
           │
           ├─────────────────────────────────┐
           │                                 │
           ▼                                 ▼
┌──────────────────────┐        ┌──────────────────────┐
│    technologies      │        │   request_items      │
│──────────────────────│        │──────────────────────│
│ id (PK)              │        │ id (PK)              │
│ name                 │        │ title                │
│ sub_city_id (FK)     │        │ sub_city_id (FK)     │
│ ...                  │        │ submitted_by (FK)    │
└──────────────────────┘        └──────────────────────┘

           │                                 │
           │                                 │
           ▼                                 ▼
┌──────────────────────┐        ┌──────────────────────┐
│      surveys         │        │       audits         │
│──────────────────────│        │──────────────────────│
│ id (PK)              │        │ id (PK)              │
│ title                │        │ title                │
│ sub_city_id (FK)     │        │ sub_city_id (FK)     │
│ ...                  │        │ ...                  │
└──────────────────────┘        └──────────────────────┘
```

## Role & Permission Structure

```
┌─────────────────────────────────────────────────────────────┐
│                         Roles                               │
└─────────────────────────────────────────────────────────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │   ITDB   │  │ Sub-City │  │ Sub-City │
        │  Admin   │  │  Admin   │  │   User   │
        └────┬─────┘  └────┬─────┘  └────┬─────┘
             │             │             │
             │             │             │
             ▼             ▼             ▼
┌────────────────────────────────────────────────────────────┐
│                      Permissions                           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ITDB Admin:                                               │
│  • All sub-city management permissions                     │
│  • All system permissions                                  │
│  • Cross-tenant access                                     │
│                                                            │
│  Sub-City Admin:                                           │
│  • Manage users (own sub-city)                             │
│  • Create/edit technologies                                │
│  • Submit requests                                         │
│  • View reports                                            │
│  • Manage cybersecurity                                    │
│                                                            │
│  Sub-City User:                                            │
│  • View data (own sub-city)                                │
│  • Limited create/edit                                     │
│  • Participate in surveys                                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Multi-Tenancy Implementation

```
┌─────────────────────────────────────────────────────────────┐
│              Data Isolation Strategy                        │
└─────────────────────────────────────────────────────────────┘

1. Database Level:
   ┌──────────────────────────────────────┐
   │  Foreign Key: sub_city_id            │
   │  • All tenant data linked to sub-city│
   │  • Cascade deletes                   │
   │  • Referential integrity             │
   └──────────────────────────────────────┘

2. Application Level:
   ┌──────────────────────────────────────┐
   │  SubCityScope Middleware             │
   │  • Automatic query scoping           │
   │  • Inject sub_city_id filter         │
   │  • Bypass for super admins           │
   └──────────────────────────────────────┘

3. Model Level:
   ┌──────────────────────────────────────┐
   │  Global Scopes (optional)            │
   │  • Automatic filtering in models     │
   │  • Relationship constraints          │
   └──────────────────────────────────────┘

4. Controller Level:
   ┌──────────────────────────────────────┐
   │  Explicit Checks                     │
   │  • Verify ownership                  │
   │  • Validate access                   │
   │  • Log violations                    │
   └──────────────────────────────────────┘
```

## File Storage Structure

```
storage/
└── app/
    └── public/
        └── sub-cities/
            └── logos/
                ├── bole-logo.png
                ├── arada-logo.png
                ├── kirkos-logo.png
                └── ...

public/
└── storage/ (symlink)
    └── sub-cities/
        └── logos/
            └── (accessible via URL)
```

## API Response Structure

```json
{
  "sub_city": {
    "id": 1,
    "name": "Bole Sub-City",
    "code": "BSC",
    "description": "...",
    "admin_name": "John Doe",
    "admin_email": "admin@bole.gov.et",
    "is_active": true,
    "statistics": {
      "total_users": 25,
      "active_users": 23,
      "total_technologies": 15,
      "total_requests": 45,
      "pending_requests": 8
    },
    "administrator": {
      "id": 10,
      "name": "John Doe",
      "email": "admin@bole.gov.et"
    }
  }
}
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Stack                           │
└─────────────────────────────────────────────────────────────┘

Layer 1: Network
├── HTTPS/TLS encryption
└── CORS policies

Layer 2: Authentication
├── Laravel Passport (OAuth2)
├── Token-based auth
└── Session management

Layer 3: Authorization
├── Role-based access control
├── Permission checks
└── Middleware guards

Layer 4: Data Isolation
├── SubCityScope middleware
├── Foreign key constraints
└── Query filtering

Layer 5: Application
├── Input validation
├── SQL injection prevention
├── XSS protection
└── CSRF protection

Layer 6: Audit
├── Activity logging
├── Access tracking
└── Change history
```

---

**This architecture ensures:**
- ✅ Complete data isolation between sub-cities
- ✅ Scalable multi-tenant design
- ✅ Secure access control
- ✅ Maintainable codebase
- ✅ Extensible for future features
