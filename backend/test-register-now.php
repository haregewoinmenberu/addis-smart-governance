<?php

// Test institution registration after removing dd()

$url = 'http://127.0.0.1:8080/api/institutions/register';

$data = [
    'institution_name' => 'Test Health Center ' . time(),
    'institution_type' => 'HEALTH_CENTER',
    'email' => 'test' . time() . '@health.gov.et',
    'phone' => '+251911234567',
    'contact_name' => 'Test Admin',
    'contact_email' => 'admin' . time() . '@health.gov.et',
    'contact_phone' => '+251911234568',
    'contact_position' => 'Director',
    'password' => 'Password123!',
    'password_confirmation' => 'Password123!',
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
]);

echo "Testing institution registration...\n";
echo "URL: $url\n\n";

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $httpCode\n";

if ($error) {
    echo "cURL Error: $error\n";
}

echo "\nResponse:\n";
echo $response;
echo "\n\n";

// Try to decode JSON
$decoded = json_decode($response, true);
if (json_last_error() === JSON_ERROR_NONE) {
    echo "Parsed Response:\n";
    print_r($decoded);
} else {
    echo "Response is not valid JSON\n";
    echo "First 500 characters of response:\n";
    echo substr($response, 0, 500);
}
