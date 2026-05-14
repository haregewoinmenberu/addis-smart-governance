# STRP - Smart Technology Request Portal

![Addis Ababa ITDB](https://aaitdb.gov.et/uploads/Setting/addis-ababa-city-administration-innovation-and-techenology-development-bureau-2026-03-26-69c4de59f1c4a.png)

## Overview

The Smart Technology Request Portal (STRP) is a comprehensive governance platform developed for the Addis Ababa City Administration Innovation and Technology Development Bureau (ITDB). This system streamlines technology request management, audits, vendor management, and workflow approvals across all sub-cities of Addis Ababa.

## Features

### Core Modules
- **Technology Request Management** - Submit, track, and approve technology requests
- **Technology Registry** - Centralized catalog of approved technologies
- **Audit Management** - Schedule and conduct technology audits
- **Vendor Management** - Track and approve technology vendors
- **Workflow Engine** - Configurable approval workflows
- **Cybersecurity Monitoring** - Track and manage security incidents
- **Survey System** - Conduct technology surveys
- **Reporting & Analytics** - Comprehensive dashboards and reports

### User Management
- **Role-Based Access Control (RBAC)** - Three primary roles:
  - ITDB Administrator (full system access)
  - Sub-City Administrator (sub-city scoped access)
  - Auditor (read-only audit access)
- **Multi-Tenant Architecture** - Sub-city data isolation
- **User Profile Management** - Self-service profile and security settings
- **Session Management** - Multi-device session tracking and control

### System Settings
- **General Settings** - Organization configuration
- **Branding** - Logo, colors, and theme customization
- **Security Policies** - SSO, MFA, password rotation, session timeout
- **Notification Channels** - Email, SMS, in-app, webhook
- **Workflow Configuration** - Auto-escalation, approvals, signatures

## Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Routing**: TanStack Router with file-based routing
- **State Management**: TanStack Query (React Query)
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite

### Backend
- **Framework**: Laravel 11 (PHP 8.2+)
- **Authentication**: Laravel Passport (OAuth2)
- **Database**: MySQL/MariaDB
- **Caching**: Redis (optional)
- **API**: RESTful API with JSON responses

## Installation

### Prerequisites
- Node.js 18+ and npm/bun
- PHP 8.2+
- Composer
- MySQL/MariaDB
- Redis (optional, for caching)

### Frontend Setup
```bash
# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun run dev
```

### Backend Setup
```bash
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=addis_smart_governance
# DB_USERNAME=root
# DB_PASSWORD=

# Run migrations
php artisan migrate

# Seed database with default data
php artisan db:seed

# Install Passport
php artisan passport:install

# Start development server
php artisan serve
```

## Configuration

### Environment Variables

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:8000/api
```

**Backend (.env)**
```env
APP_NAME="Addis Ababa City ITDB"
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=addis_smart_governance
DB_USERNAME=root
DB_PASSWORD=

CACHE_DRIVER=redis
SESSION_DRIVER=database
QUEUE_CONNECTION=database
```

## Default Users

After seeding, the following users are available:

| Email | Password | Role |
|-------|----------|------|
| admin@itdb.gov.et | password | ITDB Administrator |
| bole@itdb.gov.et | password | Sub-City Administrator (Bole) |
| auditor@itdb.gov.et | password | Auditor |

## Project Structure

```
addis-smart-governance/
├── backend/                 # Laravel backend
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   ├── Services/
│   │   └── Traits/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
│       └── api.php
├── src/                     # React frontend
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard components
│   │   ├── layout/         # Layout components
│   │   ├── settings/       # Settings components
│   │   └── ui/             # UI primitives
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities and helpers
│   ├── routes/             # File-based routes
│   └── types/              # TypeScript types
└── public/                 # Static assets
```

## API Documentation

### Authentication
```
POST   /api/auth/login              - Login
POST   /api/auth/logout             - Logout
GET    /api/auth/me                 - Get current user
PUT    /api/auth/profile            - Update profile
POST   /api/auth/change-password    - Change password
GET    /api/auth/sessions           - Get active sessions
DELETE /api/auth/sessions/{id}      - Revoke session
```

### Settings
```
GET    /api/settings                - Get all settings
PUT    /api/settings                - Update settings
GET    /api/settings/{key}          - Get single setting
PUT    /api/settings/{key}          - Update single setting
```

### Users
```
GET    /api/users                   - List users
POST   /api/users                   - Create user
GET    /api/users/{id}              - Get user
PUT    /api/users/{id}              - Update user
DELETE /api/users/{id}              - Delete user
```

### Technology Requests
```
GET    /api/requests                - List requests
POST   /api/requests                - Create request
GET    /api/requests/{id}           - Get request
PUT    /api/requests/{id}           - Update request
POST   /api/requests/{id}/submit    - Submit request
```

## Development

### Running Tests
```bash
# Frontend tests
npm test

# Backend tests
cd backend
php artisan test
```

### Code Quality
```bash
# Frontend linting
npm run lint

# Backend code style
cd backend
./vendor/bin/pint
```

## Deployment

### Production Build
```bash
# Frontend
npm run build

# Backend
cd backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Server Requirements
- PHP 8.2+
- MySQL 8.0+ or MariaDB 10.3+
- Nginx or Apache
- SSL certificate (recommended)
- Redis (optional, for caching)

## Security

- All API endpoints require authentication
- Role-based access control (RBAC)
- Permission-based authorization
- Activity logging and audit trail
- Session management with timeout
- Password rotation policies
- Multi-factor authentication support
- IP allowlist capability

## Support

For technical support or questions:
- **Organization**: Addis Ababa City Administration ITDB
- **Website**: https://aaitdb.gov.et
- **Documentation**: See `/docs` directory

## License

Proprietary - Addis Ababa City Administration Innovation and Technology Development Bureau

## Acknowledgments

Developed for the Addis Ababa City Administration Innovation and Technology Development Bureau to support smart city initiatives and technology governance across all sub-cities.

---

**Version**: 1.0.0  
**Last Updated**: May 2026  
**Maintained by**: Addis Ababa City Administration ITDB
