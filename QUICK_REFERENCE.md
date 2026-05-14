# Sub-City Multi-Tenant - Quick Reference Card

## 🚀 Quick Commands

### Setup (One-time)
```bash
# 1. Run migration
cd backend
php artisan migrate --path=database/migrations/2026_05_14_000001_create_sub_cities_table.php

# 2. Seed roles
php artisan db:seed --class=SubCityRoleSeeder

# 3. Create storage link
php artisan storage:link
```

### Verify Installation
```bash
# Check routes
php artisan route:list --path=sub-cities

# Check database
php artisan tinker
>>> App\Models\SubCity::count()
```

---

## 📍 Key URLs

| Page | URL | Access |
|------|-----|--------|
| Sub-Cities Management | `/sub-cities` | ITDB Admin |
| Dashboard | `/` | All Users |
| Login | `/login` | Public |

---

## 🔑 API Endpoints

### List Sub-Cities
```http
GET /api/sub-cities?search=bole&is_active=true
```

### Register Sub-City
```http
POST /api/sub-cities
Content-Type: multipart/form-data

name=Bole Sub-City
code=BSC
admin_name=John Doe
admin_email=admin@bole.gov.et
admin_password=SecurePass123!
```

### Get Details
```http
GET /api/sub-cities/1
```

### Get Statistics
```http
GET /api/sub-cities/1/statistics
```

### Activate/Deactivate
```http
POST /api/sub-cities/1/activate
POST /api/sub-cities/1/deactivate
```

---

## 👥 User Roles

| Role | Access Level | Can Do |
|------|-------------|--------|
| **ITDB Administrator** | All sub-cities | Register, manage, view all |
| **Sub-City Administrator** | Own sub-city only | Manage users, submit requests |
| **Sub-City User** | Own sub-city only | View data, limited actions |

---

## 📊 Database Tables

### sub_cities
```sql
id, name, code, description, address, phone, email, 
website, logo, admin_name, admin_email, admin_phone,
settings, metadata, is_active, subscription_tier
```

### users (updated)
```sql
... existing fields ...
sub_city_id (foreign key to sub_cities)
```

---

## 🔒 Permissions

### Sub-City Management (ITDB Admin only)
- `view_sub_cities`
- `create_sub_cities`
- `edit_sub_cities`
- `delete_sub_cities`

### Sub-City Admin Permissions
- `view_dashboard`
- `view_users`, `create_users`, `edit_users`, `delete_users`
- `view_requests`, `create_requests`, `edit_requests`
- `view_technologies`, `create_technologies`
- `view_reports`, `create_reports`
- `view_cybersecurity`, `manage_cybersecurity`
- And more...

---

## 📁 File Locations

### Backend
```
backend/
├── app/
│   ├── Models/SubCity.php
│   ├── Http/
│   │   ├── Controllers/Api/SubCityController.php
│   │   └── Middleware/SubCityScope.php
├── database/
│   ├── migrations/2026_05_14_000001_create_sub_cities_table.php
│   └── seeders/SubCityRoleSeeder.php
└── routes/api.php (updated)
```

### Frontend
```
src/
└── routes/sub-cities.tsx
```

### Documentation
```
├── SUB_CITY_MULTI_TENANT_GUIDE.md
├── SUB_CITY_FEATURE_SUMMARY.md
├── IMPLEMENTATION_COMPLETE.md
├── QUICK_REFERENCE.md (this file)
└── backend/SETUP_SUB_CITY.md
```

---

## 🐛 Troubleshooting

### Issue: Cannot access /sub-cities
**Solution:** Check if user has `view_sub_cities` permission

### Issue: Sub-city admin sees other sub-cities' data
**Solution:** Verify `SubCityScope` middleware is applied

### Issue: Logo not displaying
**Solution:** Run `php artisan storage:link`

### Issue: Cannot create users in sub-city
**Solution:** Ensure `sub_city_id` is set correctly

---

## 📞 Quick Help

### Check Logs
```bash
tail -f storage/logs/laravel.log
```

### Clear Cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### Database Check
```bash
php artisan tinker
>>> App\Models\SubCity::with('users')->first()
>>> App\Models\User::where('sub_city_id', 1)->count()
```

---

## 🎯 Common Tasks

### Register a Sub-City (Frontend)
1. Go to `/sub-cities`
2. Click "Register Sub-City"
3. Fill in organization details
4. Fill in administrator details
5. Upload logo (optional)
6. Click "Register Sub-City"

### Login as Sub-City Admin
1. Go to `/login`
2. Use admin email from registration
3. Use password from registration
4. Dashboard shows only your sub-city's data

### Add User to Sub-City
1. Login as sub-city admin
2. Go to `/users`
3. Click "Add User"
4. Fill in details (sub_city_id auto-set)
5. Assign role
6. Save

---

## 📈 Statistics Available

Per Sub-City:
- Total users
- Active users
- Total technologies
- Total requests
- Pending requests
- Total audits
- Cybersecurity issues

System-Wide:
- Total sub-cities
- Active sub-cities
- Inactive sub-cities
- Total users across all sub-cities

---

## 🔐 Security Checklist

- [x] Data scoped by sub_city_id
- [x] Middleware enforces isolation
- [x] Permissions checked on all actions
- [x] Passwords hashed
- [x] File uploads validated
- [x] Activity logged
- [x] Foreign key constraints
- [x] Soft deletes enabled

---

## 📚 Documentation Links

- **Full User Guide**: `SUB_CITY_MULTI_TENANT_GUIDE.md`
- **Setup Instructions**: `backend/SETUP_SUB_CITY.md`
- **Technical Summary**: `SUB_CITY_FEATURE_SUMMARY.md`
- **Implementation Status**: `IMPLEMENTATION_COMPLETE.md`

---

## 💡 Tips

1. **Always use unique codes** for sub-cities (e.g., BSC, ASC, KSC)
2. **Keep administrator emails** accessible for password resets
3. **Upload logos** for better branding (max 2MB)
4. **Monitor statistics** regularly for insights
5. **Deactivate instead of delete** to preserve history

---

## 🎓 Training Resources

### Video Tutorials (To Be Created)
- [ ] How to register a sub-city
- [ ] How to manage users
- [ ] How to submit requests
- [ ] How to view reports

### User Manuals
- [x] ITDB Administrator Guide
- [x] Sub-City Administrator Guide
- [x] API Documentation

---

**Last Updated:** May 14, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
