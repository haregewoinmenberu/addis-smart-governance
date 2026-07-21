<?php
/**
 * Update Roles - Add Smart City Officer
 * Run: php update-roles.php
 */

require __DIR__.'/vendor/autoload.php';

use App\Models\Role;
use App\Models\Permission;

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n";
echo "========================================\n";
echo "Adding Smart City Officer Role\n";
echo "========================================\n\n";

// Create Smart City Officer role
$role = Role::firstOrCreate(
    ['name' => 'smart_city_officer'],
    [
        'display_name' => 'Smart City Officer',
        'description' => 'Implements smart city initiatives and coordinates with stakeholders.',
    ]
);

if ($role->wasRecentlyCreated) {
    echo "✓ Created new role: Smart City Officer\n";
} else {
    echo "✓ Role already exists: Smart City Officer\n";
}

// Assign permissions
$permissionNames = [
    'view_dashboard',
    'view_requests',
    'receive_requests',
    'view_research',
    'view_reports',
    'view_notifications',
    'send_notifications',
];

$permissions = Permission::whereIn('name', $permissionNames)->pluck('id')->toArray();
$role->permissions()->sync($permissions);

echo "✓ Assigned " . count($permissions) . " permissions to Smart City Officer\n";

echo "\n";
echo "========================================\n";
echo "Role Update Complete!\n";
echo "========================================\n\n";

echo "Now Smart City Sector Head can create Smart City Officers.\n";
echo "Test: php artisan hierarchy:test smartcity@itdb.gov.et\n\n";
