<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class Event extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'date',
        'start_time',
        'end_time',
        'location',
        'flyer_path',
        'image_url',
        'certificate_template_path',
        'max_participants',
        'is_active',
        'registration_deadline',
        // Certificate fields
        'has_certificate',
        'certificate_required',
        // Organizer fields
        'organizer_type',
        'status',
        'organizer_name',
        'organizer_email',
        'organizer_contact',
        'category',
        'category_id',
        'price',
        'registration_date',
        'submitted_at',
        'approved_at',
        'rejected_at',
        'approved_by',
        'rejection_reason',
        // Payment settings
        'payment_methods',
        'bank_account_info',
        'payment_instructions',
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'registration_deadline' => 'datetime',
        'is_active' => 'boolean',
        'max_participants' => 'integer',
        // Certificate casts
        'has_certificate' => 'boolean',
        'certificate_required' => 'boolean',
        // Organizer casts
        'price' => 'decimal:2',
        'registration_date' => 'datetime',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        // Payment settings casts
        'payment_methods' => 'array',
        'bank_account_info' => 'array',
    ];

    protected $appends = [
        'is_registration_open',
        'is_past_event',
        'full_date_time',
        'current_participants_count',
        'can_admin_create',
        'is_event_day',
        'is_attendance_open',
    ];

    // Relationships
    public function participants()
    {
        return $this->belongsToMany(User::class, 'event_participant', 'event_id', 'participant_id')
            ->using(EventParticipant::class)
            ->withPivot(['id', 'registration_number', 'attendance_token', 'attendance_verified_at', 'has_received_certificate'])
            ->withTimestamps();
    }

    public function eventParticipants()
    {
        return $this->hasMany(EventParticipant::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function certificates()
    {
        return $this->hasMany(Certificate::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function categoryRelation()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }


    // Scopes
    public function scopeUpcoming($query)
    {
        return $query->where('date', '>=', now()->toDateString())
            ->where('is_active', true)
            ->orderBy('date')
            ->orderBy('start_time');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhere('location', 'like', "%{$search}%");
        });
    }

    // Accessors
    public function getIsRegistrationOpenAttribute()
    {
        // PRIORITY 1: Check if event has already started (registration closes when event starts)
        $date = $this->date instanceof Carbon ? $this->date->format('Y-m-d') : $this->date;
        $time = $this->start_time instanceof Carbon ? $this->start_time->format('H:i:s') : $this->start_time;
        $eventDateTime = Carbon::parse($date . ' ' . $time);
        if ($eventDateTime->isPast()) {
            return false;
        }

        // PRIORITY 2: Check if registration deadline has passed
        // If registration deadline is null, assume registration is open (will close when event starts)
        if ($this->registration_deadline) {
            // Set deadline to end of day (23:59:59) to allow registration until end of deadline date
            $deadlineDate = Carbon::parse($this->registration_deadline)->endOfDay();
            if (now()->gt($deadlineDate)) {
                return false;
            }
        }

        return true;
    }

    public function getIsPastEventAttribute()
    {
        $date = $this->date instanceof Carbon ? $this->date->format('Y-m-d') : $this->date;
        $time = $this->end_time instanceof Carbon ? $this->end_time->format('H:i:s') : $this->end_time;
        $eventDateTime = Carbon::parse($date . ' ' . $time);
        return $eventDateTime->isPast();
    }

    public function getFullDateTimeAttribute()
    {
        $date = $this->date instanceof Carbon ? $this->date->format('Y-m-d') : $this->date;
        $time = $this->start_time instanceof Carbon ? $this->start_time->format('H:i:s') : $this->start_time;
        return $date . ' ' . $time;
    }

    public function getCurrentParticipantsCountAttribute()
    {
        return $this->eventParticipants()->count();
    }

    public function getCanAdminCreateAttribute()
    {
        $eventDate = Carbon::parse($this->date);
        return now()->diffInDays($eventDate) >= 3;
    }

    public function getIsEventDayAttribute()
    {
        return $this->date->isToday();
    }

    public function getIsAttendanceOpenAttribute()
    {
        if (!$this->is_event_day) {
            return false;
        }

        // Use start_time directly if it's already a datetime
        if ($this->start_time instanceof Carbon) {
            $eventStartTime = $this->start_time;
        } else {
            $eventStartTime = Carbon::parse($this->date->format('Y-m-d') . ' ' . $this->start_time->format('H:i:s'));
        }
        return now()->gte($eventStartTime);
    }

    // Methods
    public function isRegistrationOpen()
    {
        return $this->is_registration_open;
    }

    public function canAdminCreate()
    {
        return $this->can_admin_create;
    }

    public function isAttendanceOpen()
    {
        return $this->is_attendance_open;
    }

    public function hasReachedMaxParticipants()
    {
        if (!$this->max_participants) {
            return false;
        }
        return $this->current_participants_count >= $this->max_participants;
    }

    public function canUserRegister($userId)
    {
        // Check if user is already registered
        $isRegistered = $this->eventParticipants()->where('participant_id', $userId)->exists();

        return !$isRegistered &&
               $this->isRegistrationOpen() &&
               !$this->hasReachedMaxParticipants();
    }

    public function generateRegistrationNumber()
    {
        $prefix = 'EVT' . $this->id;
        $count = $this->eventParticipants()->count() + 1;
        return $prefix . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    public function generateAttendanceToken()
    {
        return str_pad(random_int(0, 9999999999), 10, '0', STR_PAD_LEFT);
    }


    /**
     * Get event status - returns actual database status
     */
    public function getEventStatus(): string
    {
        // Return the actual database status
        return $this->status ?? 'draft';
    }

    /**
     * Get computed event status based on date and time
     */
    public function getComputedEventStatus(): string
    {
        $now = now();

        // Parse event date
        $eventDate = Carbon::parse($this->date);

        // If event has start_time, use it for more accurate status
        if ($this->start_time) {
            // Parse start_time properly
            $startTime = Carbon::parse($this->start_time);
            $eventDateTime = $eventDate->copy()->setTime($startTime->hour, $startTime->minute, $startTime->second);
        } else {
            $eventDateTime = $eventDate;
        }

        if ($eventDateTime->isPast()) {
            return 'completed';
        } elseif ($eventDateTime->isToday()) {
            return 'ongoing';
        } else {
            return 'upcoming';
        }
    }
}
