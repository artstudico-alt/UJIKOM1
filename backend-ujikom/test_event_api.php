<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Event;
use App\Http\Resources\EventResource;

try {
    echo "Testing Event API Response\n";
    echo "==========================\n\n";

    // Test getting event by ID
    $eventId = 42;
    $event = Event::with(['creator', 'eventParticipants.participant'])
        ->withCount('eventParticipants as current_participants')
        ->find($eventId);

    if ($event) {
        echo "✅ Event found (ID: $eventId)\n\n";

        $resource = new EventResource($event);
        $data = $resource->toArray(request());

        echo "Event Resource Data:\n";
        echo json_encode($data, JSON_PRETTY_PRINT) . "\n\n";

        echo "Key Fields:\n";
        echo "- ID: " . ($data['id'] ?? 'MISSING') . "\n";
        echo "- Title: " . ($data['title'] ?? 'MISSING') . "\n";
        echo "- Status: " . ($data['status'] ?? 'MISSING') . "\n";
        echo "- Image: " . ($data['image'] ?? 'MISSING') . "\n";
        echo "- Date: " . ($data['date'] ?? 'MISSING') . "\n";

    } else {
        echo "❌ Event not found (ID: $eventId)\n";
    }

    echo "\n\n";

    // Test getting all published events
    echo "Testing Public Events List\n";
    echo "==========================\n\n";

    $events = Event::where('status', 'published')
        ->with(['creator'])
        ->withCount('eventParticipants as current_participants')
        ->limit(5)
        ->get();

    echo "✅ Found " . $events->count() . " published events\n\n";

    foreach ($events as $event) {
        $resource = new EventResource($event);
        $data = $resource->toArray(request());
        echo "ID: " . ($data['id'] ?? 'MISSING') . " | Title: " . ($data['title'] ?? 'MISSING') . "\n";
    }

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
