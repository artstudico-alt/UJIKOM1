<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\NotificationService;

class ScheduleNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:schedule';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Schedule and process all notification tasks';

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
        $this->info('Starting notification scheduling...');

        try {
            // Schedule event reminders (1 day before event)
            $this->info('Scheduling event reminders...');
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

            $this->info('Notification scheduling completed successfully!');
            return 0;

        } catch (\Exception $e) {
            $this->error('Error scheduling notifications: ' . $e->getMessage());
            return 1;
        }
    }
}
