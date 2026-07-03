# Quick Start Guide - Addis Smart Governance Platform

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PHP 8.2+
- Composer
- MySQL/PostgreSQL database
- XAMPP or similar (for local development)

---

## 📦 Installation

### 1. Backend Setup (Laravel)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=addis_smart_governance
DB_USERNAME=root
DB_PASSWORD=

# Run migrations
php artisan migrate

# Seed database (optional)
php artisan db:seed

# Start development server
php artisan serve
# Backend will run at: http://127.0.0.1:8000
```

### 2. Frontend Setup (React + Vite)

```bash
# Navigate to project root
cd ..

# Install dependencies
npm install

# Configure environment
# Create/edit .env file with:
VITE_API_URL=http://127.0.0.1:8000/api

# Start development server
npm run dev
# Frontend will run at: http://localhost:8080
```

---

## 🎯 Testing the System

### Test 1: Access Landing Page
1. Open browser to `http://localhost:8080`
2. You should see the landing page with:
   - Navbar with "Register Institution" button
   - Hero section
   - Services showcase
   - Call-to-action sections

### Test 2: Register an Institution
1. Click "Register Institution" in navbar
2. Fill out the registration form:
   - **Institution Name**: Test Health Center
   - **Type**: HEALTH_CENTER
   - **Email**: test@example.com
   - **Phone**: +251911234567
   - **TIN**: 123456789
   - **Primary Contact**: John Doe
   - **Contact Email**: john@example.com
   - **Password**: Password123!
3. Submit the form
4. You should receive a success message with reference number

### Test 3: Login as Institution
1. Go to `/login`
2. Login with:
   - Email: `john@example.com` (primary contact email)
   - Password: `Password123!`
3. You should be redirected to `/dashboard`
4. Dashboard should show:
   - Institution information header
   - Quick stats (Total, Pending, Approved, Notifications)
   - Tabbed interface (Overview, Requests, Notifications, Documents, Analytics)

### Test 4: View Service Pages
1. Visit `/services/research`
2. Should see:
   - Service details
   - Features list
   - Benefits
   - Workflow steps
   - Registration form
3. Test other services:
   - `/services/transformation`
   - `/services/licensing`
   - `/services/lms`

---

## 🔑 User Accounts & Roles

### User Types
- **INTERNAL**: ITDB staff (admin, analysts, auditors, reviewers)
- **INSTITUTIONAL**: External institution users (clients)

### Default Roles (if seeded)
- ITDB Administrator (full access)
- System Administrator (technical admin)
- ITDB Analyst (data analysis)
- ITDB Reviewer (approval workflows)
- Sub-City Administrator (regional admin)
- Institutional User (client access)

### Creating Admin User

```bash
cd backend

# Using Laravel Tinker
php artisan tinker

# Create admin user
$user = new App\Models\User;
$user->name = 'System Admin';
$user->email = 'admin@aaitdb.gov.et';
$user->password = bcrypt('Admin123!');
$user->user_type = 'INTERNAL';
$user->is_active = true;
$user->email_verified_at = now();
$user->save();

# Assign role (after seeding roles)
$role = App\Models\Role::where('name', 'itdb_administrator')->first();
$user->assignRole($role);

exit
```

---

## 🛠️ Development Workflow

### Running Both Servers Simultaneously

**Terminal 1 - Backend:**
```bash
cd backend
php artisan serve
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Clearing Cache (if needed)
```bash
cd backend
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

---

## 📋 API Endpoints Reference

### Public Endpoints (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/institutions/register` | Register new institution |
| GET | `/api/institutions/types` | Get institution types list |
| POST | `/api/service-forms/submit` | Submit service request |
| GET | `/api/service-forms/status/{ref}` | Check submission status |
| POST | `/api/auth/login` | User login |

### Protected Endpoints (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/institutions/my-institution` | Get my institution |
| GET | `/api/institutions/{id}/requests` | Get institution requests |
| GET | `/api/notifications` | Get notifications |
| GET | `/api/notifications/unread-count` | Unread count |
| POST | `/api/notifications/{id}/read` | Mark as read |

### Admin Endpoints (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/institutions` | List all institutions |
| POST | `/api/institutions/{id}/verify` | Verify institution |
| POST | `/api/institutions/{id}/change-status` | Change status |
| GET | `/api/dashboard` | Executive dashboard |

---

## 🧪 Testing with API Client

### Using Postman/Insomnia

**1. Register Institution:**
```http
POST http://127.0.0.1:8000/api/institutions/register
Content-Type: application/json

{
  "institution_name": "Test Hospital",
  "institution_amharic_name": "ሙከራ ሆስፒታል",
  "institution_type": "HOSPITAL",
  "email": "hospital@test.com",
  "phone": "+251911234567",
  "tin_number": "1234567890",
  "registration_number": "REG-001",
  "address": "Addis Ababa, Bole",
  "website": "https://test-hospital.com",
  "description": "Test hospital for system testing",
  "contact_name": "Jane Smith",
  "contact_position": "IT Manager",
  "contact_email": "jane@test.com",
  "contact_phone": "+251912345678",
  "alternative_phone": "+251913456789",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!"
}
```

**2. Login:**
```http
POST http://127.0.0.1:8000/api/auth/login
Content-Type: application/json

{
  "email": "jane@test.com",
  "password": "SecurePass123!"
}
```

**3. Get My Institution (with token):**
```http
GET http://127.0.0.1:8000/api/institutions/my-institution
Authorization: Bearer {your_token_here}
```

---

## 🐛 Troubleshooting

### Issue: "Only HTML requests are supported"
**Solution**: This has been fixed. Ensure you're using the latest code with `ForceJsonResponse` middleware.

### Issue: 404 on API endpoints
**Solution**: 
1. Check backend is running on port 8000
2. Clear Laravel cache: `php artisan config:clear`
3. Verify `.env` has `VITE_API_URL=http://127.0.0.1:8000/api`

### Issue: CORS errors
**Solution**:
1. Check `backend/config/cors.php` includes `http://localhost:8080`
2. Restart backend server

### Issue: Database connection failed
**Solution**:
1. Verify MySQL/PostgreSQL is running
2. Check database credentials in `backend/.env`
3. Create database: `CREATE DATABASE addis_smart_governance;`

### Issue: Frontend can't connect to backend
**Solution**:
1. Check `.env` has correct API URL
2. Verify backend is running: `curl http://127.0.0.1:8000/api/health`
3. Check browser console for errors

---

## 📱 Application Flow

### For Institutions (Clients)

1. **Registration**
   - Visit landing page
   - Click "Register Institution"
   - Fill registration form
   - Receive confirmation with credentials
   - Status: PENDING (awaiting verification)

2. **Account Activation**
   - ITDB admin reviews registration
   - Admin verifies institution
   - Status changes to ACTIVE
   - Institution receives email notification

3. **Using the Platform**
   - Login with credentials
   - Access institution dashboard
   - View institution profile
   - Submit service requests
   - Track request status
   - Receive notifications
   - View analytics

### For ITDB Staff (Internal Users)

1. **Login**
   - Login with ITDB credentials
   - Access executive dashboard
   - View system-wide statistics

2. **Institution Management**
   - Review pending registrations
   - Verify institutions
   - Manage institution status
   - View institution details

3. **Request Processing**
   - Review service requests
   - Approve/reject requests
   - Assign to team members
   - Track progress

---

## 🎨 Customization

### Changing Theme Colors

Edit `src/styles.css`:
```css
:root {
  --primary: 210 100% 50%;    /* Blue */
  --secondary: 220 15% 92%;   /* Light Gray */
  /* ... */
}
```

### Adding New Service Type

1. Add to `src/lib/services-data.ts`
2. Add validation schema to `src/lib/service-forms-schema.ts`
3. Service will automatically appear in services list

### Adding Institution Type

1. Update database enum in migration
2. Add to `src/lib/institution-schema.ts`
3. Restart backend

---

## 📊 Database Schema

### Key Tables

- `users` - All system users (internal + institutional)
- `roles` - User roles with permissions
- `institutions` - Registered institutions
- `service_form_submissions` - Service requests
- `notifications` - User notifications
- `activity_logs` - Audit trail

### Relationships

```
User -> Institution (belongsTo)
Institution -> Users (hasMany)
Institution -> ServiceFormSubmissions (hasMany)
User -> Notifications (hasMany)
```

---

## 🔐 Security Checklist

- [x] Password hashing with bcrypt
- [x] API authentication with Sanctum
- [x] Role-based access control
- [x] Input validation (frontend + backend)
- [x] CSRF protection
- [x] SQL injection prevention (Eloquent ORM)
- [x] XSS prevention (React escaping)
- [ ] Rate limiting (to implement)
- [ ] 2FA (to implement)

---

## 📝 Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Frontend: Vite automatically reloads on file changes
- Backend: Use Laravel Pint for code formatting

### Database Reset
```bash
cd backend
php artisan migrate:fresh --seed
```

### View Routes
```bash
cd backend
php artisan route:list
```

### Check Logs
- Backend: `backend/storage/logs/laravel.log`
- Frontend: Browser console

---

## 🚀 Deployment

### Production Checklist
- [ ] Set `APP_ENV=production` in backend `.env`
- [ ] Set `APP_DEBUG=false` in backend `.env`
- [ ] Generate production assets: `npm run build`
- [ ] Configure production database
- [ ] Set up SSL certificates
- [ ] Configure production API URL
- [ ] Set up backup system
- [ ] Configure email service (for notifications)
- [ ] Set up monitoring (e.g., Sentry)

---

## 📞 Support

### Getting Help
1. Check `IMPLEMENTATION_STATUS.md` for feature status
2. Review this guide for common issues
3. Check error logs
4. Contact development team

### Contributing
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request
5. Request code review

---

**Happy Coding! 🎉**

For detailed feature documentation, see `IMPLEMENTATION_STATUS.md`
