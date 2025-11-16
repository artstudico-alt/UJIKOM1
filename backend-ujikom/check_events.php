<?php
// Quick script to check events in database

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Event;

echo "=== DATABASE EVENT CHECK ===\n\n";

// Count total events
$total = Event::count();
echo "📊 Total Events in Database: {$total}\n\n";

if ($total > 0) {
    echo "📋 Latest 10 Events:\n";
    echo str_repeat("-", 120) . "\n";
    printf("%-5s | %-30s | %-20s | %-15s | %-12s | %-20s\n",
        "ID", "Title", "Status", "Organizer Type", "User ID", "Created At");
    echo str_repeat("-", 120) . "\n";

    Event::latest()->take(10)->get()->each(function($event) {
        printf("%-5s | %-30s | %-20s | %-15s | %-12s | %-20s\n",
            $event->id,
            substr($event->title, 0, 30),
            $event->status,
            $event->organizer_type ?? 'N/A',
            $event->user_id ?? 'N/A',
            $event->created_at->format('Y-m-d H:i:s')
        );
    });
    echo str_repeat("-", 120) . "\n\n";

    // Group by status
    echo "📊 Events by Status:\n";
    $statusCounts = Event::selectRaw('status, COUNT(*) as count')
        ->groupBy('status')
        ->get();

    foreach ($statusCounts as $stat) {
        echo "  - {$stat->status}: {$stat->count}\n";
    }
    echo "\n";

    // Group by organizer type
    echo "📊 Events by Organizer Type:\n";
    $typeCounts = Event::selectRaw('organizer_type, COUNT(*) as count')
        ->groupBy('organizer_type')
        ->get();

    foreach ($typeCounts as $type) {
        $orgType = $type->organizer_type ?? 'NULL';
        echo "  - {$orgType}: {$type->count}\n";
    }
} else {
    echo "❌ No events found in database!\n";
    echo "📝 Try creating an event through the frontend.\n";
}

echo "\n=== END CHECK ===\n";
