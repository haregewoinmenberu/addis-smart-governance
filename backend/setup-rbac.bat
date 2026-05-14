@echo off
echo ========================================
echo RBAC System Setup Script
echo ========================================
echo.

echo Step 1: Running migrations...
php artisan migrate:fresh
if %errorlevel% neq 0 (
    echo ERROR: Migration failed!
    pause
    exit /b 1
)
echo ✓ Migrations completed successfully
echo.

echo Step 2: Seeding database...
php artisan db:seed
if %errorlevel% neq 0 (
    echo ERROR: Seeding failed!
    pause
    exit /b 1
)
echo ✓ Database seeded successfully
echo.

echo Step 3: Installing Passport...
php artisan passport:install
if %errorlevel% neq 0 (
    echo ERROR: Passport installation failed!
    pause
    exit /b 1
)
echo ✓ Passport installed successfully
echo.

echo Step 4: Clearing caches...
php artisan cache:clear
php artisan config:clear
php artisan route:clear
echo ✓ Caches cleared
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Default Users Created:
echo.
echo 1. ITDB Administrator
echo    Email: admin@itdb.gov.et
echo    Password: password123
echo.
echo 2. Sub-City Administrator
echo    Email: subcity@addis.gov.et
echo    Password: password123
echo.
echo 3. Auditor
echo    Email: auditor@itdb.gov.et
echo    Password: password123
echo.
echo ========================================
echo Next Steps:
echo 1. Start the server: php artisan serve
echo 2. Test login with one of the default users
echo 3. Check the API: http://localhost:8000/api/auth/login
echo ========================================
echo.
pause
