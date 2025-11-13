<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Event;

echo "=== UPDATING EVENTS TO HAVE CERTIFICATES ===\n\n";

// Update first 2 events to have certificates
$events = Event::limit(2)->get();
foreach ($events as $event) {
    $event->has_certificate = true;
    $event->save();
    echo "Updated event: {$event->title} (ID: {$event->id}) - has_certificate = true\n";
}

echo "\n=== VERIFICATION ===\n";
$eventsWithCertificates = Event::where('has_certificate', true)->count();
echo "Events with has_certificate = true: $eventsWithCertificates\n";

echo "\n=== END ===\n";
