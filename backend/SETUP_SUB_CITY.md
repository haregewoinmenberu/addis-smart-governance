# Sub-City Multi-Tenant Setup Instructions

## Quick Setup Guide

Follow these steps to set up the Sub-City Multi-Tenant system:

### Step 1: Run Database Migrations

```bash
cd backend
php artisan migrate
```

This will create the `sub_cities` table and add the `sub_city_id` foreign key to the `users` table.

### Step 2: Seed Roles and Permissions

```bash
php artisan db:seed --class=SubCityRoleSeeder
```

This creates:
- `sub_city_admin` role with appropriate permissions
- Sub-city management permissions for ITDB administrators

### Step 3: Create Storage Link

```bash
php artisan storage:link
```

This creates a symbolic link for storing sub-city logos.

### Step 4: Verify Installation

Test the API endpoint:
```bash
curl -X GET http://localhost:8000/api/sub-cities \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 5: Register First Sub-City

Use the frontend at `/sub-cities` or via API:

```bash
curl -X POST http://localhost:8000/api/sub-cities \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "name=Bole Sub-City" \
  -F "code=BSC" \
  -F "description=Bole Sub-City Administration" \
  -F "admin_name=John Doe" \
  -F "admin_email=admin@bole.gov.et" \
  -F "admin_password=SecurePass123!"
```

## Verification Checklist

- [ ] Migrations completed successfully
- [ ] Roles and permissions seeded
- [ ] Storage link created
- [ ] Can access `/sub-cities` endpoint
- [ ] Can register a new sub-city
- [ ] Sub-city admin can log in
- [ ] Sub-city admin sees only their data

## Rollback (if needed)

To rollback the changes:

```bash
# Rollback migration
php artisan migrate:rollback --step=1

# Remove seeded data (manual)
# Delete from roles where name = 'sub_city_admin'
# Delete from permissions where module = 'sub_cities'
```

## Configuration

### Environment Variables

No additional environment variables are required. The system uses existing Laravel configuration.

### File Storage

Sub-city logos are stored in:
- Path: `storage/app/public/sub-cities/logos/`
- Public URL: `/storage/sub-cities/logos/`

Ensure the storage directory has proper permissions:
```bash
chmod -R 775 storage
chown -R www-data:www-data storage
```

## Testing

### Test Sub-City Registration

```php
// In tinker or test file
use App\Models\SubCity;
use App\Models\User;

$subCity = SubCity::create([
    'name' => 'Test Sub-City',
    'code' => 'TSC',
    'admin_name' => 'Test Admin',
    'admin_email' => 'test@test.com',
    'is_active' => true,
    'activated_at' => now(),
]);

// Verify
echo $subCity->id; // Should return ID
echo $subCity->getStatistics(); // Should return statistics array
```

### Test Data Scoping

```php
// Login as sub-city admin
$user = User::where('email', 'admin@bole.gov.et')->first();
Auth::login($user);

// Verify scoping
$technologies = Technology::all(); // Should only return sub-city's technologies
```

## Troubleshooting

### Issue: Migration fails with foreign key error

**Solution:**
```bash
# Check if users table exists
php artisan migrate:status

# If needed, refresh migrations (WARNING: This will delete all data)
php artisan migrate:fresh
php artisan db:seed
```

### Issue: Storage link already exists

**Solution:**
```bash
# Remove existing link
rm public/storage

# Recreate link
php artisan storage:link
```

### Issue: Permission denied on storage

**Solution:**
```bash
# Linux/Mac
sudo chmod -R 775 storage bootstrap/cache
sudo chown -R $USER:www-data storage bootstrap/cache

# Windows (run as administrator)
icacls storage /grant Users:F /T
```

## Next Steps

After setup:

1. **Configure Frontend Routes**
   - Add `/sub-cities` to navigation menu
   - Update user profile to show sub-city information

2. **Update Existing Controllers**
   - Add sub-city scoping to relevant controllers
   - Update queries to filter by `sub_city_id`

3. **Test Multi-Tenancy**
   - Create multiple sub-cities
   - Verify data isolation
   - Test administrator permissions

4. **Documentation**
   - Train ITDB administrators on sub-city registration
   - Create user guide for sub-city administrators
   - Document data access policies

## Support

If you encounter issues:

1. Check Laravel logs: `storage/logs/laravel.log`
2. Enable debug mode: Set `APP_DEBUG=true` in `.env`
3. Check database connection: `php artisan tinker` then `DB::connection()->getPdo()`
4. Verify permissions: `php artisan route:list | grep sub-cities`

## Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Multi-Tenancy Best Practices](https://laravel.com/docs/multi-tenancy)
- [API Documentation](./API_DOCUMENTATION.md)
- [User Guide](../SUB_CITY_MULTI_TENANT_GUIDE.md)
