<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Event;
use App\Models\User;
use App\Models\EventParticipant;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send notification for new event
     */
    public function sendNewEventNotification(Event $event): void
    {
        try {
            // Get all verified users
            $users = User::where('is_verified', true)->get();
            
            foreach ($users as $user) {
                Notification::create([
                    'user_id' => $user->id,
                    'event_id' => $event->id,
                    'type' => 'new_event',
                    'title' => 'Event Baru Tersedia',
                    'message' => "Event '{$event->title}' telah dibuka untuk pendaftaran. Segera daftar sebelum kuota penuh!",
                    'data' => [
                        'event_title' => $event->title,
                        'event_date' => $event->date->format('Y-m-d'),
                        'event_location' => $event->location,
                        'event_time' => $event->start_time ? $event->start_time->format('H:i') : null,
                    ],
                ]);
            }

            Log::info('New event notifications sent', [
                'event_id' => $event->id,
                'event_title' => $event->title,
                'users_count' => $users->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send new event notifications', [
                'event_id' => $event->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send reminder notification for upcoming events
     */
    public function sendEventReminderNotifications(): void
    {
        try {
            // Get events that start tomorrow
            $tomorrow = Carbon::tomorrow();
            $events = Event::whereDate('date', $tomorrow)
                ->where('is_active', true)
                ->with('eventParticipants.participant')
                ->get();

            foreach ($events as $event) {
                $participants = $event->eventParticipants;
                
                foreach ($participants as $participant) {
                    Notification::create([
                        'user_id' => $participant->participant_id,
                        'event_id' => $event->id,
                        'type' => 'event_reminder',
                        'title' => 'Pengingat Event: ' . $event->title,
                        'message' => "Event '{$event->title}' akan dimulai besok. Jangan lupa untuk hadir!",
                        'data' => [
                            'event_title' => $event->title,
                            'event_date' => $event->date->format('Y-m-d'),
                            'event_time' => $event->start_time ? $event->start_time->format('H:i') : null,
                            'event_location' => $event->location,
                        ],
                    ]);
                }
            }

            Log::info('Event reminder notifications sent', [
                'events_count' => $events->count(),
                'date' => $tomorrow->format('Y-m-d'),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send event reminder notifications', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send notification when attendance starts
     */
    public function sendAttendanceStartedNotification(Event $event): void
    {
        try {
            $participants = $event->eventParticipants()->with('participant')->get();
            
            foreach ($participants as $participant) {
                Notification::create([
                    'user_id' => $participant->participant_id,
                    'event_id' => $event->id,
                    'type' => 'attendance_started',
                    'title' => 'Daftar Hadir Dimulai: ' . $event->title,
                    'message' => "Daftar hadir untuk event '{$event->title}' telah dimulai. Silakan lakukan absensi!",
                    'data' => [
                        'event_title' => $event->title,
                        'attendance_token' => $participant->attendance_token,
                        'event_date' => $event->date->format('Y-m-d'),
                        'event_time' => $event->start_time ? $event->start_time->format('H:i') : null,
                    ],
                ]);
            }

            Log::info('Attendance started notifications sent', [
                'event_id' => $event->id,
                'event_title' => $event->title,
                'participants_count' => $participants->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send attendance started notifications', [
                'event_id' => $event->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send notification when event is completed
     */
    public function sendEventCompletedNotification(Event $event): void
    {
        try {
            $participants = $event->eventParticipants()->with('participant')->get();
            
            foreach ($participants as $participant) {
                Notification::create([
                    'user_id' => $participant->participant_id,
                    'event_id' => $event->id,
                    'type' => 'event_completed',
                    'title' => 'Event Selesai: ' . $event->title,
                    'message' => "Event '{$event->title}' telah selesai. Terima kasih telah berpartisipasi!",
                    'data' => [
                        'event_title' => $event->title,
                        'has_certificate' => $event->has_certificate,
                        'event_date' => $event->date->format('Y-m-d'),
                    ],
                ]);
            }

            Log::info('Event completed notifications sent', [
                'event_id' => $event->id,
                'event_title' => $event->title,
                'participants_count' => $participants->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send event completed notifications', [
                'event_id' => $event->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Check and send notifications for events starting today
     */
    public function checkAndSendAttendanceNotifications(): void
    {
        try {
            $today = Carbon::today();
            $now = Carbon::now();
            
            // Get events that start today and are currently active for attendance
            $events = Event::whereDate('date', $today)
                ->where('is_active', true)
                ->get();

            foreach ($events as $event) {
                // Check if event should start attendance
                if ($event->start_time && $now->gte($event->start_time)) {
                    // Check if we haven't already sent attendance notification
                    $hasSentNotification = Notification::where('event_id', $event->id)
                        ->where('type', 'attendance_started')
                        ->exists();

                    if (!$hasSentNotification) {
                        $this->sendAttendanceStartedNotification($event);
                    }
                }
            }

            Log::info('Attendance notifications check completed', [
                'date' => $today->format('Y-m-d'),
                'time' => $now->format('H:i:s'),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to check attendance notifications', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Check and send notifications for completed events
     */
    public function checkAndSendCompletedEventNotifications(): void
    {
        try {
            $now = Carbon::now();
            
            // Get events that have ended
            $events = Event::where('is_active', true)
                ->where(function ($query) use ($now) {
                    $query->where('end_time', '<=', $now)
                          ->orWhere(function ($q) use ($now) {
                              $q->whereDate('date', '<', $now->toDateString())
                                ->whereNull('end_time');
                          });
                })
                ->get();

            foreach ($events as $event) {
                // Check if we haven't already sent completion notification
                $hasSentNotification = Notification::where('event_id', $event->id)
                    ->where('type', 'event_completed')
                    ->exists();

                if (!$hasSentNotification) {
                    $this->sendEventCompletedNotification($event);
                }
            }

            Log::info('Completed event notifications check completed', [
                'events_checked' => $events->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to check completed event notifications', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send notification when certificate is generated
     */
    public function sendCertificateGeneratedNotification($certificate, $user): void
    {
        try {
            Notification::create([
                'user_id' => $user->id,
                'event_id' => $certificate->event_id,
                'type' => 'certificate_generated',
                'title' => 'Sertifikat Telah Dibuat',
                'message' => "Sertifikat untuk event '{$certificate->event->title}' telah siap. Silakan unduh sertifikat Anda!",
                'data' => [
                    'event_title' => $certificate->event->title,
                    'certificate_number' => $certificate->certificate_number,
                    'event_date' => $certificate->event->date->format('Y-m-d'),
                    'download_url' => route('certificates.download', $certificate->id),
                ],
            ]);

            Log::info('Certificate generated notification sent', [
                'certificate_id' => $certificate->id,
                'user_id' => $user->id,
                'event_title' => $certificate->event->title,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send certificate generated notification', [
                'certificate_id' => $certificate->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send notification when user successfully registers for event
     */
    public function sendEventRegistrationNotification($event, $user): void
    {
        try {
            Notification::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'type' => 'event_registration',
                'title' => 'Pendaftaran Berhasil',
                'message' => "Anda telah berhasil mendaftar untuk event '{$event->title}'. Jangan lupa untuk hadir pada tanggal yang ditentukan!",
                'data' => [
                    'event_title' => $event->title,
                    'event_date' => $event->date->format('Y-m-d'),
                    'event_time' => $event->start_time ? $event->start_time->format('H:i') : null,
                    'event_location' => $event->location,
                ],
            ]);

            Log::info('Event registration notification sent', [
                'event_id' => $event->id,
                'user_id' => $user->id,
                'event_title' => $event->title,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send event registration notification', [
                'event_id' => $event->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send notification when event registration deadline is approaching
     */
    public function sendRegistrationDeadlineReminder(): void
    {
        try {
            // Get events with registration deadline in 24 hours
            $tomorrow = Carbon::tomorrow();
            $events = Event::whereDate('registration_deadline', $tomorrow)
                ->where('is_active', true)
                ->with('eventParticipants.participant')
                ->get();

            foreach ($events as $event) {
                $participants = $event->eventParticipants;
                
                foreach ($participants as $participant) {
                    Notification::create([
                        'user_id' => $participant->participant_id,
                        'event_id' => $event->id,
                        'type' => 'registration_deadline',
                        'title' => 'Batas Pendaftaran Mendekati',
                        'message' => "Pendaftaran untuk event '{$event->title}' akan ditutup besok. Pastikan Anda sudah terdaftar!",
                        'data' => [
                            'event_title' => $event->title,
                            'deadline' => $event->registration_deadline->format('Y-m-d H:i'),
                            'event_date' => $event->date->format('Y-m-d'),
                        ],
                    ]);
                }
            }

            Log::info('Registration deadline reminder notifications sent', [
                'events_count' => $events->count(),
                'date' => $tomorrow->format('Y-m-d'),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send registration deadline reminder notifications', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Process all scheduled notifications
     */
    public function processScheduledNotifications(): void
    {
        try {
            $scheduledNotifications = Notification::scheduled()->get();
            
            foreach ($scheduledNotifications as $notification) {
                // Mark as sent (remove scheduled_at)
                $notification->update(['scheduled_at' => null]);
            }

            Log::info('Scheduled notifications processed', [
                'count' => $scheduledNotifications->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to process scheduled notifications', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
