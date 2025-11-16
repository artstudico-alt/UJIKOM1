<?php
// Test script to verify CREATE and DELETE operations on database

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Event;
use Illuminate\Support\Facades\DB;

echo "\n";
echo "╔═══════════════════════════════════════════════════════════════════╗\n";
echo "║          DATABASE TEST: CREATE & DELETE EVENT                    ║\n";
echo "╚═══════════════════════════════════════════════════════════════════╝\n\n";

// Step 1: Check current count
$initialCount = Event::count();
echo "📊 STEP 1: Initial Database Check\n";
echo "   Total events BEFORE test: {$initialCount}\n\n";

// Step 2: Create test event
echo "🔨 STEP 2: Creating Test Event...\n";
try {
    $testEvent = Event::create([
        'title' => 'TEST EVENT - Database Verification',
        'description' => 'This is a test event to verify database CREATE operation',
        'date' => date('Y-m-d', strtotime('+7 days')),
        'start_time' => '10:00:00',
        'end_time' => '12:00:00',
        'location' => 'Test Location - Database',
        'max_participants' => 50,
        'registration_deadline' => date('Y-m-d', strtotime('+5 days')),
        'registration_date' => date('Y-m-d', strtotime('+1 day')),
        'organizer_name' => 'Database Test Organizer',
        'organizer_email' => 'test@database.com',
        'organizer_contact' => '081234567890',
        'category' => 'Testing',
        'price' => 0,
        'user_id' => 74, // Existing user ID from your database
        'organizer_type' => 'organizer',
        'status' => 'pending_approval',
        'submitted_at' => now(),
        'is_active' => false
    ]);

    echo "   ✅ Event created successfully!\n";
    echo "   📝 Event ID: {$testEvent->id}\n";
    echo "   📝 Event Title: {$testEvent->title}\n";
    echo "   📝 Status: {$testEvent->status}\n";
    echo "   📝 Created At: {$testEvent->created_at}\n\n";

    // Step 3: Verify in database
    $afterCreateCount = Event::count();
    echo "📊 STEP 3: Verify CREATE Operation\n";
    echo "   Total events AFTER create: {$afterCreateCount}\n";
    echo "   Difference: " . ($afterCreateCount - $initialCount) . " (Should be +1)\n";

    if ($afterCreateCount == $initialCount + 1) {
        echo "   ✅ CREATE operation SUCCESSFUL - Event is in database!\n\n";
    } else {
        echo "   ❌ CREATE operation FAILED - Event not in database!\n\n";
        exit(1);
    }

    // Step 4: Read from database to confirm
    $foundEvent = Event::find($testEvent->id);
    echo "📖 STEP 4: Read Event from Database\n";
    if ($foundEvent) {
        echo "   ✅ Event found in database:\n";
        echo "      - ID: {$foundEvent->id}\n";
        echo "      - Title: {$foundEvent->title}\n";
        echo "      - Status: {$foundEvent->status}\n";
        echo "      - Organizer: {$foundEvent->organizer_name}\n";
        echo "      - Date: {$foundEvent->date}\n\n";
    } else {
        echo "   ❌ Event NOT found in database!\n\n";
        exit(1);
    }

    // Step 5: Delete test event
    echo "🗑️  STEP 5: Deleting Test Event...\n";
    $deletedId = $testEvent->id;
    $testEvent->delete();
    echo "   ✅ Delete command executed\n\n";

    // Step 6: Verify deletion
    $afterDeleteCount = Event::count();
    echo "📊 STEP 6: Verify DELETE Operation\n";
    echo "   Total events AFTER delete: {$afterDeleteCount}\n";
    echo "   Difference: " . ($initialCount - $afterDeleteCount) . " (Should be 0)\n";

    if ($afterDeleteCount == $initialCount) {
        echo "   ✅ DELETE operation SUCCESSFUL - Event removed from database!\n\n";
    } else {
        echo "   ❌ DELETE operation FAILED - Event still in database!\n\n";
        exit(1);
    }

    // Step 7: Try to find deleted event
    $deletedEvent = Event::find($deletedId);
    echo "🔍 STEP 7: Confirm Event is Deleted\n";
    if ($deletedEvent === null) {
        echo "   ✅ Event ID {$deletedId} NOT found in database (CORRECT!)\n";
        echo "   ✅ DELETE operation verified!\n\n";
    } else {
        echo "   ❌ Event ID {$deletedId} STILL EXISTS in database (ERROR!)\n\n";
        exit(1);
    }

    // Final Summary
    echo "╔═══════════════════════════════════════════════════════════════════╗\n";
    echo "║                        TEST RESULTS                               ║\n";
    echo "╠═══════════════════════════════════════════════════════════════════╣\n";
    echo "║  ✅ CREATE Event → Database         [PASSED]                     ║\n";
    echo "║  ✅ READ Event → Database           [PASSED]                     ║\n";
    echo "║  ✅ DELETE Event → Database         [PASSED]                     ║\n";
    echo "║                                                                   ║\n";
    echo "║  🎉 ALL DATABASE OPERATIONS WORKING CORRECTLY! 🎉                ║\n";
    echo "╚═══════════════════════════════════════════════════════════════════╝\n\n";

    echo "📊 Final Statistics:\n";
    echo "   - Initial count: {$initialCount}\n";
    echo "   - After create: {$afterCreateCount}\n";
    echo "   - After delete: {$afterDeleteCount}\n";
    echo "   - Final count: {$initialCount} (RESTORED)\n\n";

} catch (\Exception $e) {
    echo "❌ ERROR: {$e->getMessage()}\n";
    echo "   File: {$e->getFile()}\n";
    echo "   Line: {$e->getLine()}\n\n";
    exit(1);
}

echo "✅ Test completed successfully!\n\n";
