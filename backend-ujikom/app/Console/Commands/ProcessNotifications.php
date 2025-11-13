<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\NotificationService;

class ProcessNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:process';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process all notification tasks including reminders, attendance, and completed events';

    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        parent::__construct();
        $this->notificationService = $notificationService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting notification processing...');

        try {
            // Process event reminders (events starting tomorrow)
            $this->info('Processing event reminders...');
            $this->notificationService->sendEventReminderNotifications();

            // Check and send attendance notifications
            $this->info('Checking attendance notifications...');
            $this->notificationService->checkAndSendAttendanceNotifications();

            // Check and send completed event notifications
            $this->info('Checking completed event notifications...');
            $this->notificationService->checkAndSendCompletedEventNotifications();

            // Process scheduled notifications
            $this->info('Processing scheduled notifications...');
            $this->notificationService->processScheduledNotifications();

            $this->info('Notification processing completed successfully!');
            return 0;

        } catch (\Exception $e) {
            $this->error('Error processing notifications: ' . $e->getMessage());
            return 1;
        }
    }
}
