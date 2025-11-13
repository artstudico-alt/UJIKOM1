<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'event_id',
        'type',
        'title',
        'message',
        'data',
        'is_read',
        'read_at',
        'scheduled_at',
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'scheduled_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeScheduled($query)
    {
        return $query->whereNotNull('scheduled_at')
                    ->where('scheduled_at', '<=', now());
    }

    // Methods
    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    public function markAsUnread()
    {
        $this->update([
            'is_read' => false,
            'read_at' => null,
        ]);
    }

    public function isScheduled()
    {
        return !is_null($this->scheduled_at);
    }

    public function isOverdue()
    {
        return $this->isScheduled() && $this->scheduled_at->isPast();
    }

    // Static methods for creating notifications
    public static function createNewEventNotification($event, $users = null)
    {
        if (!$users) {
            $users = User::where('is_verified', true)->get();
        }

        foreach ($users as $user) {
            self::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'type' => 'new_event',
                'title' => 'Event Baru: ' . $event->title,
                'message' => "Event baru '{$event->title}' telah tersedia. Daftar sekarang!",
                'data' => [
                    'event_title' => $event->title,
                    'event_date' => $event->date->format('Y-m-d'),
                    'event_location' => $event->location,
                ],
            ]);
        }
    }

    public static function createEventReminderNotification($event, $participants)
    {
        foreach ($participants as $participant) {
            self::create([
                'user_id' => $participant->participant_id,
                'event_id' => $event->id,
                'type' => 'event_reminder',
                'title' => 'Pengingat Event: ' . $event->title,
                'message' => "Event '{$event->title}' akan dimulai besok. Jangan lupa untuk hadir!",
                'data' => [
                    'event_title' => $event->title,
                    'event_date' => $event->date->format('Y-m-d'),
                    'event_time' => $event->start_time->format('H:i'),
                    'event_location' => $event->location,
                ],
                'scheduled_at' => $event->date->subDay(),
            ]);
        }
    }

    public static function createAttendanceStartedNotification($event, $participants)
    {
        foreach ($participants as $participant) {
            self::create([
                'user_id' => $participant->participant_id,
                'event_id' => $event->id,
                'type' => 'attendance_started',
                'title' => 'Daftar Hadir Dimulai: ' . $event->title,
                'message' => "Daftar hadir untuk event '{$event->title}' telah dimulai. Silakan lakukan absensi!",
                'data' => [
                    'event_title' => $event->title,
                    'attendance_token' => $participant->attendance_token,
                ],
            ]);
        }
    }

    public static function createEventCompletedNotification($event, $participants)
    {
        foreach ($participants as $participant) {
            self::create([
                'user_id' => $participant->participant_id,
                'event_id' => $event->id,
                'type' => 'event_completed',
                'title' => 'Event Selesai: ' . $event->title,
                'message' => "Event '{$event->title}' telah selesai. Terima kasih telah berpartisipasi!",
                'data' => [
                    'event_title' => $event->title,
                    'has_certificate' => $event->has_certificate,
                ],
            ]);
        }
    }
}
