<?php

// Clear PHP OPcache and Laravel caches
header('Content-Type: text/plain');

echo "=== Clearing Caches ===\n\n";

// Clear PHP OPcache
if (function_exists('opcache_reset')) {
    opcache_reset();
    echo "✓ OPcache cleared!\n";
} else {
    echo "⚠ OPcache not enabled\n";
}

// Clear Laravel caches
$basePath = dirname(__DIR__);
chdir($basePath);

echo "\nClearing Laravel caches...\n";

exec('php artisan config:clear 2>&1', $output1, $return1);
echo ($return1 === 0 ? "✓" : "✗") . " Config cache: " . implode("\n", $output1) . "\n";

exec('php artisan route:clear 2>&1', $output2, $return2);
echo ($return2 === 0 ? "✓" : "✗") . " Route cache: " . implode("\n", $output2) . "\n";

exec('php artisan view:clear 2>&1', $output3, $return3);
echo ($return3 === 0 ? "✓" : "✗") . " View cache: " . implode("\n", $output3) . "\n";

exec('php artisan cache:clear 2>&1', $output4, $return4);
echo ($return4 === 0 ? "✓" : "✗") . " Application cache: " . implode("\n", $output4) . "\n";

echo "\n=== Testing API Endpoint ===\n\n";

// Test the endpoint
$testData = [
    'institution_name' => 'Test Institution',
    'institution_type' => 'BUREAU',
    'email' => 'test@test.com',
    'phone' => '+251911111111',
    'contact_name' => 'Test User',
    'contact_email' => 'user@test.com',
    'contact_phone' => '+251922222222',
    'contact_position' => 'Director',
    'password' => 'Password123!',
    'password_confirmation' => 'Password123!',
];

$ch = curl_init('http://127.0.0.1:8080/api/institutions/register');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: $httpCode\n";
echo "Response Type: " . (json_decode($response) ? "JSON" : "Non-JSON") . "\n\n";
echo "Response:\n";
echo $response . "\n";

echo "\n=== Done ===\n";
echo "Please try your institution registration again.\n";

