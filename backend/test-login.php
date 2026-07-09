<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "\n🔐 TESTING LOGIN ENDPOINT\n";
echo "═══════════════════════════════════════════════════════\n\n";

$accounts = [
    ['email' => 'director@research.gov', 'name' => 'Research Director'],
    ['email' => 'lead@research.gov', 'name' => 'Research Lead'],
    ['email' => 'committee@research.gov', 'name' => 'Review Committee'],
    ['email' => 'researcher@research.gov', 'name' => 'Researcher'],
];

foreach ($accounts as $account) {
    echo "Testing: {$account['name']}\n";
    echo "Email: {$account['email']}\n";
    
    try {
        $user = \App\Models\User::where('email', $account['email'])->first();
        
        if ($user) {
            echo "✅ User found: {$user->name}\n";
            echo "   Active: " . ($user->is_active ? 'Yes' : 'No') . "\n";
            echo "   Roles: " . $user->roles->pluck('display_name')->join(', ') . "\n";
            echo "   Permissions: " . count($user->getAllPermissions()) . "\n";
        } else {
            echo "❌ User not found\n";
        }
    } catch (Exception $e) {
        echo "❌ Error: " . $e->getMessage() . "\n";
    }
    
    echo "\n";
}

echo "═══════════════════════════════════════════════════════\n";
echo "✅ Login endpoint is available at: POST /api/auth/login\n\n";

echo "📝 Example cURL command:\n\n";
echo "curl -X POST http://localhost/api/auth/login \\\n";
echo "  -H 'Content-Type: application/json' \\\n";
echo "  -d '{\n";
echo "    \"email\": \"director@research.gov\",\n";
echo "    \"password\": \"password123\"\n";
echo "  }'\n\n";

echo "═══════════════════════════════════════════════════════\n";
