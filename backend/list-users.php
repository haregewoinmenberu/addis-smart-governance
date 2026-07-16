<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

echo "\n";
echo "═══════════════════════════════════════════════════════════════════════════════════\n";
echo "   ALL USERS LIST\n";
echo "═══════════════════════════════════════════════════════════════════════════════════\n\n";

$users = User::with('roles')->orderBy('id')->get();

echo sprintf("%-4s | %-30s | %-35s | %-30s\n", "ID", "Name", "Email", "Role");
echo str_repeat("─", 105) . "\n";

foreach ($users as $user) {
    $roles = $user->roles->pluck('name')->implode(', ');
    $roles = $roles ?: 'No role assigned';   
    
    echo sprintf("%-4s | %-30s | %-35s | %-30s\n", 
        $user->id,
        substr($user->name, 0, 30),
        substr($user->email, 0, 35),
        substr($roles, 0, 30)
    );
}

echo "\n";
echo "Total Users: " . $users->count() . "\n";
echo "\n";

echo "═══════════════════════════════════════════════════════════════════════════════════\n";
echo "   LOGIN CREDENTIALS (default password for all: password)\n";
echo "═══════════════════════════════════════════════════════════════════════════════════\n\n";

$groupedUsers = $users->groupBy(function($user) {
    $role = $user->roles->first();
    return $role ? $role->display_name : 'No Role';
});

foreach ($groupedUsers as $roleName => $roleUsers) {
    echo "{$roleName}:\n";
    foreach ($roleUsers as $user) {
        echo "  • Email: {$user->email}\n";
        echo "    Password: password\n";
    }
    echo "\n";
}

echo "═══════════════════════════════════════════════════════════════════════════════════\n\n";
