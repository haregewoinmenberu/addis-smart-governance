<?php

// Simple test script to check institution registration endpoint

$url = 'http://127.0.0.1:8080/api/institutions/types';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Testing /api/institutions/types\n";
echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

// Now test register endpoint
$url2 = 'http://127.0.0.1:8080/api/institutions/register';

$data = [
    'institution_name' => 'Test Bureau ' . time(),
    'institution_type' => 'BUREAU',
    'email' => 'test' . time() . '@bureau.gov.et',
    'phone' => '+251911234567',
    'contact_name' => 'John Doe',
    'contact_email' => 'john.doe' . time() . '@bureau.gov.et',
    'contact_phone' => '+251911234568',
    'contact_position' => 'IT Director',
    'password' => 'password123',
    'password_confirmation' => 'password123',
];

$ch2 = curl_init($url2);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_POST, true);
curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
]);

$response2 = curl_exec($ch2);
$httpCode2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
curl_close($ch2);

echo "Testing /api/institutions/register\n";
echo "HTTP Code: $httpCode2\n";
echo "Response: $response2\n";

