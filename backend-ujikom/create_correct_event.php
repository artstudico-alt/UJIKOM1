<?php
// Script untuk membuat event dengan data yang benar
require_once 'vendor/autoload.php';

echo "=== CREATE CORRECT EVENT ===\n";

// Login dulu
$loginData = [
    'email' => 'admin@admin.com',
    'password' => 'admin123'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$loginResponse = curl_exec($ch);
$loginHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$loginData = json_decode($loginResponse, true);
$token = $loginData['data']['token'];

echo "Token: " . substr($token, 0, 20) . "...\n";

// Create event with correct future date
$eventData = [
    'title' => 'Webinar Test Status - Akan Datang',
    'description' => 'Event untuk test status akan datang',
    'date' => '2025-12-25', // Future date
    'start_time' => '09:00',
    'end_time' => '17:00',
    'location' => 'Online',
    'max_participants' => '100',
    'registration_deadline' => '2025-12-24',
    'is_active' => '1'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/events');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($eventData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded',
    'Accept: application/json',
    'Authorization: Bearer ' . $token
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "\nCreate Event Response ($httpCode):\n";
echo $response . "\n";

// Get all events to see the new one
echo "\n--- All Events ---\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/events');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Authorization: Bearer ' . $token
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$events = json_decode($response, true);
if (isset($events['data'])) {
    foreach ($events['data'] as $event) {
        echo "ID: {$event['id']} - Title: {$event['title']} - Date: {$event['date']} - Status: " . ($event['status'] ?? 'NOT FOUND') . "\n";
    }
}

echo "\n=== COMPLETED ===\n";
?>
