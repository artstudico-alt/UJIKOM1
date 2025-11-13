<?php
// Compare API call vs frontend form submission
echo "=== COMPARE API vs FRONTEND ===\n";

// 1. Test direct API call (yang berhasil)
echo "1. Testing direct API call...\n";
$token = "209|5e7xXEU97ySUEYQlpyetZC8I4bYeVE9h8HxAiae6106c3878";

$updateData = [
    'title' => 'Webinar Direct API Test',
    'description' => 'GAS DAFTAR',
    'date' => '2025-09-18',
    'start_time' => '16:00',
    'end_time' => '00:00',
    'location' => 'Bogor',
    'max_participants' => '100',
    'registration_deadline' => '2025-09-15',
    'is_active' => '1'
];

$formData = http_build_query($updateData);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/events/20');
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
curl_setopt($ch, CURLOPT_POSTFIELDS, $formData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded',
    'Accept: application/json',
    'Authorization: Bearer ' . $token
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "   Direct API - HTTP Code: $httpCode\n";
if ($httpCode === 200) {
    $responseData = json_decode($response, true);
    echo "   Direct API - Title: " . $responseData['data']['title'] . "\n";
}

// 2. Test dengan Content-Type multipart/form-data (seperti frontend)
echo "\n2. Testing with multipart/form-data...\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/events/20');
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
curl_setopt($ch, CURLOPT_POSTFIELDS, $formData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: multipart/form-data',
    'Accept: application/json',
    'Authorization: Bearer ' . $token
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "   Multipart API - HTTP Code: $httpCode\n";
if ($httpCode === 200) {
    $responseData = json_decode($response, true);
    echo "   Multipart API - Title: " . $responseData['data']['title'] . "\n";
} else {
    echo "   Multipart API - Error: $response\n";
}

// 3. Test dengan FormData object (seperti frontend)
echo "\n3. Testing with FormData object...\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/events/20');
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
curl_setopt($ch, CURLOPT_POSTFIELDS, $formData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Authorization: Bearer ' . $token
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "   FormData API - HTTP Code: $httpCode\n";
if ($httpCode === 200) {
    $responseData = json_decode($response, true);
    echo "   FormData API - Title: " . $responseData['data']['title'] . "\n";
} else {
    echo "   FormData API - Error: $response\n";
}

echo "\n=== COMPARISON COMPLETE ===\n";
?>
