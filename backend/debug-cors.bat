@echo off
echo ========================================
echo Laravel Debug and Cache Clear Script
echo ========================================
echo.

echo [1/6] Clearing config cache...
php artisan config:clear
echo.

echo [2/6] Clearing route cache...
php artisan route:clear
echo.

echo [3/6] Clearing view cache...
php artisan view:clear
echo.

echo [4/6] Clearing application cache...
php artisan cache:clear
echo.

echo [5/6] Optimizing clear...
php artisan optimize:clear
echo.

echo [6/6] Checking last 50 lines of log...
echo ========================================
echo.
powershell -Command "Get-Content storage\logs\laravel.log -Tail 50 -ErrorAction SilentlyContinue"
echo.

echo ========================================
echo Done! Now restart your Laravel server:
echo php artisan serve --host=0.0.0.0 --port=8000
echo ========================================
pause
