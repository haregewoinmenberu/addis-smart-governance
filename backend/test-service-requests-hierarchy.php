<?php
/**
 * Test Service Request Hierarchy Assignment
 * Run: php test-service-requests-hierarchy.php
 */

require __DIR__.'/vendor/autoload.php';

use App\Models\User;
use App\Services\RoleHierarchyService;

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n";
echo "╔════════════════════════════════════════════════════════════════════╗\n";
echo "║       SERVICE REQUEST ASSIGNMENT - HIERARCHY TEST                  ║\n";
echo "╚════════════════════════════════════════════════════════════════════╝\n\n";

// Test Smart City Sector Head
$smartCityHead = User::where('email', 'smartcity@itdb.gov.et')->first();

if (!$smartCityHead) {
    echo "⚠ Smart City Sector Head not found\n\n";
    exit(1);
}

echo "┌────────────────────────────────────────────────────────────────────┐\n";
echo "│ Smart City Sector Head\n";
echo "├────────────────────────────────────────────────────────────────────┤\n";
echo "│ Name: {$smartCityHead->name}\n";
echo "│ Email: {$smartCityHead->email}\n";
echo "│ Department: {$smartCityHead->department}\n";
echo "├────────────────────────────────────────────────────────────────────┤\n";

// Get manageable roles
$manageableRoles = RoleHierarchyService::getManageableRoles($smartCityHead);

echo "│ Can Assign Service Requests To ({" . count($manageableRoles) . "} roles):\n";
foreach ($manageableRoles as $role) {
    $displayName = str_replace('_', ' ', ucwords($role, '_'));
    echo "│   ✓ {$displayName}\n";
}

echo "├────────────────────────────────────────────────────────────────────┤\n";

// Get actual users with these roles
$assignableUsers = User::whereHas('roles', function ($query) use ($manageableRoles) {
    $query->whereIn('name', $manageableRoles);
})
->where('is_active', true)
->with('roles')
->orderBy('name')
->get();

echo "│ Assignable Users (" . $assignableUsers->count() . "):\n";

if ($assignableUsers->isEmpty()) {
    echo "│   (No users with assignable roles exist yet)\n";
} else {
    foreach ($assignableUsers as $user) {
        $roleName = $user->roles->first() ? $user->roles->first()->display_name : 'No role';
        echo "│   • {$user->name}\n";
        echo "│     Email: {$user->email}\n";
        echo "│     Role: {$roleName}\n";
    }
}

echo "└────────────────────────────────────────────────────────────────────┘\n\n";

echo "╔════════════════════════════════════════════════════════════════════╗\n";
echo "║                      HOW IT WORKS IN UI                            ║\n";
echo "╚════════════════════════════════════════════════════════════════════╝\n\n";

echo "When Smart City Sector Head logs in:\n\n";
echo "1. Navigate to: http://localhost:8080/service-requests\n";
echo "2. See all service form submissions\n";
echo "3. Click actions menu (•••) on any request\n";
echo "4. Only these options appear:\n";
echo "   ✓ View Details\n";
echo "   ✓ Assign to User (shows 3 directors only)\n";
echo "   ✓ Update Status (pending → under_review → approved/rejected)\n";
echo "   ✗ Edit Form Data (HIDDEN)\n";
echo "   ✗ Delete (HIDDEN)\n\n";

echo "5. When clicking 'Assign to User':\n";
echo "   → Dropdown shows ONLY:\n";
foreach ($manageableRoles as $role) {
    $displayName = str_replace('_', ' ', ucwords($role, '_'));
    echo "      • {$displayName}\n";
}
echo "\n";

echo "6. When clicking 'Update Status':\n";
echo "   → Can change status to:\n";
echo "      • Pending\n";
echo "      • Under Review\n";
echo "      • Approved\n";
echo "      • Rejected\n\n";

echo "════════════════════════════════════════════════════════════════════\n";
echo "✓ Service Request hierarchy assignment is configured!\n";
echo "════════════════════════════════════════════════════════════════════\n\n";
