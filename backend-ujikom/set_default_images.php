<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Event;

echo "🔧 Setting default images for events without images...\n\n";

// Get events without images
$eventsWithoutImages = Event::whereNull('flyer_path')
    ->whereNull('image_url')
    ->get();

echo "Found {$eventsWithoutImages->count()} events without images\n\n";

// Default placeholder images from Unsplash
$placeholderImages = [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop', // Conference
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=450&fit=crop', // Workshop
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=450&fit=crop', // Seminar
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=450&fit=crop', // Training
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=450&fit=crop', // Event
];

$index = 0;
foreach ($eventsWithoutImages as $event) {
    $imageUrl = $placeholderImages[$index % count($placeholderImages)];

    $event->image_url = $imageUrl;
    $event->save();

    echo "✅ Updated Event #{$event->id}: {$event->title}\n";
    echo "   Image URL: {$imageUrl}\n\n";

    $index++;
}

echo "🎉 Done! All events now have images.\n";
echo "\n📝 Note: These are placeholder images from Unsplash.\n";
echo "   Upload real event images for better results!\n";
