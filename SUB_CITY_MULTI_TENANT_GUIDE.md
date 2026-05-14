# Sub-City Multi-Tenant System Guide

## Overview

The Sub-City Multi-Tenant System allows the Addis Ababa City Innovation and Technology Development Bureau (ITDB) to register and manage multiple sub-city organizations as independent tenants. Each sub-city operates as a separate organization with its own administrator and dashboard, while ITDB maintains centralized oversight.

## Key Features

### 1. **Sub-City Registration**
- ITDB administrators can register new sub-city organizations
- Each sub-city has unique identification (name, code)
- Organizational details (address, contact, logo, etc.)
- Automatic administrator account creation during registration

### 2. **Multi-Tenant Architecture**
- Each sub-city operates as an independent organization
- Data isolation between sub-cities
- Sub-city administrators can only access their own data
- ITDB maintains full visibility across all sub-cities

### 3. **Sub-City Administrator**
- Dedicated administrator account for each sub-city
- Full management capabilities within their organization
- Can manage users, technologies, requests, and reports
- Cannot access other sub-cities' data

### 4. **Organizational Management**
- Profile management (logo, contact details, settings)
- User management within the sub-city
- Technology inventory tracking
- Request submission and monitoring
- Performance statistics and analytics

## Database Schema

### Sub-Cities Table
```sql
- id: Primary key
- name: Sub-city name (unique)
- code: Sub-city code (unique)
- description: Organization description
- address, phone, email, website: Contact information
- logo: Organization logo path
- admin_name, admin_email, admin_phone: Administrator details
- settings: JSON field for custom settings
- metadata: JSON field for additional data
- is_active: Active status
- activated_at, deactivated_at: Status timestamps
- subscription_tier: Subscription level (basic, standard, premium)
- subscription_expires_at: Subscription expiry
- created_at, updated_at, deleted_at: Timestamps
```

### Users Table (Updated)
```sql
- sub_city_id: Foreign key to sub_cities table
- (existing fields remain unchanged)
```

## Installation & Setup

### 1. Run Migrations
```bash
cd backend
php artisan migrate
```

### 2. Seed Roles and Permissions
```bash
php artisan db:seed --class=SubCityRoleSeeder
```

### 3. Create Storage Link (for logos)
```bash
php artisan storage:link
```

## API Endpoints

### Sub-City Management

#### List Sub-Cities
```http
GET /api/sub-cities
Query Parameters:
  - search: Search by name, code, or email
  - is_active: Filter by status (true/false)
  - sort_by: Sort field (default: name)
  - sort_order: Sort direction (asc/desc)
  - per_page: Items per page (default: 15)
```

#### Register Sub-City
```http
POST /api/sub-cities
Content-Type: multipart/form-data

Body:
  - name* (string): Sub-city name
  - code* (string): Sub-city code
  - description (text): Description
  - address (string): Physical address
  - phone (string): Contact phone
  - email (email): Contact email
  - website (url): Website URL
  - logo (file): Logo image
  - admin_name* (string): Administrator name
  - admin_email* (email): Administrator email
  - admin_phone (string): Administrator phone
  - admin_password* (string): Administrator password (min 8 chars)
  - settings (json): Custom settings
  - metadata (json): Additional metadata
  - subscription_tier (string): basic|standard|premium
```

#### Get Sub-City Details
```http
GET /api/sub-cities/{id}
```

#### Update Sub-City
```http
PUT /api/sub-cities/{id}
Content-Type: multipart/form-data

Body: (all fields optional)
  - name, code, description, address, phone, email, website
  - logo (file)
  - admin_name, admin_email, admin_phone
  - settings, metadata
  - subscription_tier
```

#### Activate/Deactivate Sub-City
```http
POST /api/sub-cities/{id}/activate
POST /api/sub-cities/{id}/deactivate
```

#### Get Sub-City Statistics
```http
GET /api/sub-cities/{id}/statistics

Response:
{
  "statistics": {
    "total_users": 25,
    "active_users": 23,
    "total_technologies": 15,
    "total_requests": 45,
    "pending_requests": 8,
    "total_audits": 12,
    "total_cybersecurity_issues": 3
  }
}
```

#### Get Sub-City Users
```http
GET /api/sub-cities/{id}/users
Query Parameters:
  - search: Search users
  - is_active: Filter by status
  - per_page: Items per page
```

#### Update Administrator
```http
PUT /api/sub-cities/{id}/administrator
Body:
  - user_id* (integer): New administrator user ID
```

#### Delete Sub-City
```http
DELETE /api/sub-cities/{id}
```

## User Roles & Permissions

### ITDB Administrator
- Full access to all sub-cities
- Can register, edit, activate/deactivate sub-cities
- View all data across sub-cities
- Manage system-wide settings

### Sub-City Administrator
- Full access to their own sub-city only
- Manage users within their sub-city
- Submit and manage technology requests
- View reports and analytics for their sub-city
- Cannot access other sub-cities' data

### Sub-City User
- Access limited to their sub-city
- Can view and interact with data based on assigned permissions
- Cannot manage organizational settings

## Data Isolation & Security

### Automatic Scoping
The `SubCityScope` middleware automatically filters data based on user's sub-city:
- Sub-city users only see their organization's data
- ITDB administrators bypass scoping and see all data
- Implemented at the middleware level for security

### Access Control
- Role-based permissions control feature access
- Sub-city relationship enforced at database level
- Foreign key constraints ensure data integrity

## Frontend Integration

### Sub-City Management Page
Location: `/sub-cities`

Features:
- List all sub-cities with statistics
- Search and filter capabilities
- Register new sub-cities
- View detailed information
- Activate/deactivate organizations
- Visual statistics dashboard

### User Context
When a user logs in, their response includes:
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "sub_city_id": 5,
    "sub_city_details": {
      "id": 5,
      "name": "Bole Sub-City",
      "code": "BSC",
      "logo": "/storage/sub-cities/logos/logo.png",
      "is_active": true
    },
    "roles": [...],
    "permissions": [...]
  }
}
```

## Usage Examples

### Registering a New Sub-City

1. **Via API:**
```javascript
const formData = new FormData();
formData.append('name', 'Bole Sub-City');
formData.append('code', 'BSC');
formData.append('description', 'Bole Sub-City Administration');
formData.append('address', '123 Main Street, Addis Ababa');
formData.append('phone', '+251911234567');
formData.append('email', 'info@bole.gov.et');
formData.append('admin_name', 'Jane Smith');
formData.append('admin_email', 'admin@bole.gov.et');
formData.append('admin_password', 'SecurePass123!');
formData.append('logo', logoFile);

const response = await api.post('/sub-cities', formData);
```

2. **Via Frontend:**
- Navigate to `/sub-cities`
- Click "Register Sub-City" button
- Fill in organization and administrator details
- Upload logo (optional)
- Submit form

### Sub-City Administrator Login

1. Administrator logs in with credentials created during registration
2. System automatically scopes all data to their sub-city
3. Dashboard shows only their organization's data
4. Can manage users, submit requests, view reports

### Managing Sub-City Users

Sub-city administrators can:
```javascript
// Create user in their sub-city
const newUser = {
  name: 'Staff Member',
  email: 'staff@bole.gov.et',
  password: 'password123',
  sub_city_id: currentUser.sub_city_id, // Automatically set
  department: 'IT Department',
  role: 'sub_city_user'
};

await api.post('/users', newUser);
```

## Best Practices

### 1. **Sub-City Registration**
- Use clear, descriptive names
- Assign unique codes (e.g., BSC, ASC, KSC)
- Provide complete contact information
- Use strong passwords for administrators

### 2. **Data Management**
- Regularly review sub-city statistics
- Monitor inactive sub-cities
- Keep administrator contact information updated
- Maintain organizational profiles

### 3. **Security**
- Enforce strong password policies
- Regularly audit user access
- Monitor cross-sub-city access attempts
- Keep subscription status current

### 4. **Performance**
- Use pagination for large datasets
- Implement caching where appropriate
- Regular database maintenance
- Monitor query performance

## Troubleshooting

### Common Issues

**Issue: Sub-city admin can see other sub-cities' data**
- Check if `SubCityScope` middleware is applied
- Verify user's `sub_city_id` is set correctly
- Ensure role is `sub_city_admin` not `itdb_administrator`

**Issue: Cannot create users in sub-city**
- Verify administrator has correct permissions
- Check if sub-city is active
- Ensure `sub_city_id` is being passed correctly

**Issue: Logo not displaying**
- Run `php artisan storage:link`
- Check file permissions on storage directory
- Verify logo path in database

## Future Enhancements

- [ ] Subscription management and billing
- [ ] Custom branding per sub-city
- [ ] Advanced analytics and reporting
- [ ] Inter-sub-city collaboration features
- [ ] API rate limiting per sub-city
- [ ] Custom workflow definitions per sub-city
- [ ] Multi-language support per sub-city
- [ ] Mobile app for sub-city administrators

## Support

For technical support or questions:
- Email: support@itdb.gov.et
- Documentation: [Internal Wiki]
- Issue Tracker: [GitHub/Internal System]
