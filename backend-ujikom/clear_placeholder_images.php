<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Event;

echo "🔧 Clearing placeholder images from events...\n\n";

// Get events with Unsplash placeholder images
$eventsWithPlaceholders = Event::where('image_url', 'LIKE', '%unsplash.com%')->get();

echo "Found {$eventsWithPlaceholders->count()} events with placeholder images\n\n";

foreach ($eventsWithPlaceholders as $event) {
    echo "Clearing Event #{$event->id}: {$event->title}\n";
    echo "  Old image_url: {$event->image_url}\n";

    $event->image_url = null;
    $event->save();

    echo "  ✅ Cleared\n\n";
}

echo "🎉 Done! Placeholder images cleared.\n";
echo "\n📝 Now you can test uploading real images!\n";
