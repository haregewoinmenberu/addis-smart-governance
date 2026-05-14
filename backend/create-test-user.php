<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

// Create or update test user
$user = User::updateOrCreate(
    ['email' => 'admin@test.com'],
    [
        'name' => 'Test Admin',
        'password' => Hash::make('password123'),
        'phone' => '1234567890',
        'department' => 'IT',
        'is_active' => true,
    ]
);

// Assign ITDB Administrator role
$role = Role::where('name', 'itdb_administrator')->first();
if ($role) {
    $user->roles()->sync([$role->id]);
    echo "User created/updated successfully!\n";
    echo "Email: admin@test.com\n";
    echo "Password: password123\n";
    echo "Role: ITDB Administrator\n";
} else {
    echo "Error: ITDB Administrator role not found. Please run seeders first.\n";
}
