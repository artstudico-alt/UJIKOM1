<?php
// Script untuk cek token frontend
echo "=== CHECK FRONTEND TOKEN ===\n";

// Test endpoint yang digunakan frontend
$endpoints = [
    'GET /api/events' => 'http://localhost:8000/api/events',
    'GET /api/admin/events' => 'http://localhost:8000/api/admin/events'
];

foreach ($endpoints as $name => $url) {
    echo "\n--- Testing $name ---\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "Status: $httpCode\n";
    echo "Response: " . substr($response, 0, 200) . "...\n";
}

echo "\n=== COMPLETED ===\n";
?>
