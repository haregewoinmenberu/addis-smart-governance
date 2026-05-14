<?php

/**
 * Quick test script to verify role and permission assignment
 * Run with: php test-roles.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Role;

echo "=== Role and Permission Test ===\n\n";

// Find admin user
$user = User::where('email', 'admin@itdb.gov.et')->first();

if (!$user) {
    echo "❌ Admin user not found!\n";
    echo "Run: php artisan db:seed\n";
    exit(1);
}

echo "✓ Found user: {$user->name} (ID: {$user->id})\n";
echo "  Email: {$user->email}\n";
echo "  Active: " . ($user->is_active ? 'Yes' : 'No') . "\n\n";

// Load roles
$user->load('roles.permissions');

echo "Roles ({$user->roles->count()}):\n";
if ($user->roles->isEmpty()) {
    echo "  ❌ No roles assigned!\n";
    echo "  Run: php artisan user:fix-admin-role\n\n";
} else {
    foreach ($user->roles as $role) {
        echo "  ✓ {$role->display_name} ({$role->name})\n";
        echo "    Permissions: {$role->permissions->count()}\n";
    }
    echo "\n";
}

// Get all permissions
$permissions = $user->getAllPermissions();

echo "Total Permissions: " . count($permissions) . "\n";
if (empty($permissions)) {
    echo "  ❌ No permissions found!\n";
    echo "  This means either:\n";
    echo "  1. User has no roles assigned\n";
    echo "  2. Roles have no permissions assigned\n";
    echo "  Run: php artisan db:seed --class=RolesAndPermissionsSeeder\n\n";
} else {
    echo "  First 10 permissions:\n";
    foreach (array_slice($permissions, 0, 10) as $permission) {
        echo "    - {$permission}\n";
    }
    if (count($permissions) > 10) {
        echo "    ... and " . (count($permissions) - 10) . " more\n";
    }
    echo "\n";
}

// Test specific permission checks
echo "Permission Checks:\n";
$testPermissions = [
    'view_dashboard',
    'view_users',
    'create_users',
    'view_requests',
    'approve_workflows',
];

foreach ($testPermissions as $permission) {
    $has = $user->hasPermission($permission);
    echo "  " . ($has ? '✓' : '❌') . " {$permission}\n";
}
echo "\n";

// Test role checks
echo "Role Checks:\n";
echo "  " . ($user->isITDBAdministrator() ? '✓' : '❌') . " Is ITDB Administrator\n";
echo "  " . ($user->isITDBAuditor() ? '✓' : '❌') . " Is ITDB Auditor\n";
echo "  " . ($user->isSubCityAdministrator() ? '✓' : '❌') . " Is Sub-City Administrator\n";
echo "  " . ($user->isSubCityAuditor() ? '✓' : '❌') . " Is Sub-City Auditor\n";
echo "\n";

// Check role_user pivot table
$pivotCount = \DB::table('role_user')->where('user_id', $user->id)->count();
echo "Pivot Table Entries: {$pivotCount}\n";

if ($pivotCount === 0) {
    echo "  ❌ No entries in role_user table!\n";
    echo "  Run: php artisan user:fix-admin-role\n";
} else {
    $pivotEntries = \DB::table('role_user')
        ->where('user_id', $user->id)
        ->join('roles', 'roles.id', '=', 'role_user.role_id')
        ->select('roles.name', 'roles.display_name')
        ->get();
    
    foreach ($pivotEntries as $entry) {
        echo "  ✓ {$entry->display_name} ({$entry->name})\n";
    }
}
echo "\n";

// Summary
echo "=== Summary ===\n";
if ($user->roles->count() > 0 && count($permissions) > 0) {
    echo "✓ Everything looks good!\n";
    echo "  User has {$user->roles->count()} role(s) and " . count($permissions) . " permission(s)\n";
    echo "\nNext steps:\n";
    echo "  1. Test the API: curl -H 'Authorization: Bearer TOKEN' http://127.0.0.1:8000/api/auth/me\n";
    echo "  2. Login to the frontend and check the sidebar\n";
} else {
    echo "❌ Issues found!\n";
    echo "\nFix with:\n";
    echo "  php artisan user:fix-admin-role admin@itdb.gov.et\n";
}
