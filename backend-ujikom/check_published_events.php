<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Event;

try {
    $events = Event::select('id', 'title', 'status')
        ->where('status', 'published')
        ->limit(10)
        ->get();

    echo "Published Events:\n";
    echo "================\n\n";

    if ($events->isEmpty()) {
        echo "❌ NO PUBLISHED EVENTS FOUND!\n\n";

        // Check all events
        $allEvents = Event::select('id', 'title', 'status')->limit(10)->get();
        echo "All Events (first 10):\n";
        foreach ($allEvents as $event) {
            echo "ID: {$event->id} | Title: {$event->title} | Status: {$event->status}\n";
        }
    } else {
        echo "✅ Found " . $events->count() . " published events:\n\n";
        foreach ($events as $event) {
            echo "ID: {$event->id} | Title: {$event->title} | Status: {$event->status}\n";
        }
    }

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
