<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class EventParticipant extends Model
{
    use HasFactory;

    protected $table = 'event_participant';

    protected $fillable = [
        'event_id',
        'participant_id',
        'registration_number',
        'attendance_token',
        'attendance_verified_at',
        'has_received_certificate',
        'token_generated_at',
        'token_expires_at',
        'attendance_status',
        'verification_method',
    ];

    protected $casts = [
        'attendance_verified_at' => 'datetime',
        'has_received_certificate' => 'boolean',
        'token_generated_at' => 'datetime',
        'token_expires_at' => 'datetime',
    ];

    protected $appends = [
        'is_attendance_verified',
        'can_receive_certificate',
    ];

    // Relationships
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function participant()
    {
        return $this->belongsTo(User::class, 'participant_id');
    }

    public function attendance()
    {
        return $this->hasOne(Attendance::class, 'event_participant_id');
    }

    public function certificate()
    {
        return $this->hasOne(Certificate::class, 'event_participant_id');
    }

    public function tokens()
    {
        return $this->hasMany(Token::class, 'participant_id', 'participant_id')
                    ->where('event_id', $this->event_id);
    }

    // Accessors
    public function getIsAttendanceVerifiedAttribute()
    {
        return !is_null($this->attendance_verified_at);
    }

    public function getCanReceiveCertificateAttribute()
    {
        return $this->is_attendance_verified && !$this->has_received_certificate;
    }

    // Methods
    public function generateAttendanceToken()
    {
        // Generate unique 10-digit token
        do {
            $token = str_pad(random_int(0, 9999999999), 10, '0', STR_PAD_LEFT);
        } while (self::where('attendance_token', $token)->exists());
        
        $this->attendance_token = $token;
        $this->token_generated_at = now();
        $this->token_expires_at = now()->addDays(1); // Token expires in 1 day
        $this->attendance_status = 'pending';
        $this->verification_method = 'token';
        $this->save();
        
        return $this->attendance_token;
    }

    public function verifyAttendance($token)
    {
        // Check if token matches and is not expired
        if ($this->attendance_token === $token && 
            !$this->is_attendance_verified && 
            (!$this->token_expires_at || $this->token_expires_at->isFuture())) {
            
            $this->attendance_verified_at = now();
            $this->attendance_status = 'present';
            $this->save();
            
            // Create attendance record
            $this->createAttendanceRecord();
            
            return true;
        }
        return false;
    }

    public function createAttendanceRecord()
    {
        return Attendance::create([
            'event_id' => $this->event_id,
            'participant_id' => $this->participant_id,
            'event_participant_id' => $this->id,
            'time_in' => now(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    public function isTokenValid()
    {
        return $this->attendance_token && 
               (!$this->token_expires_at || $this->token_expires_at->isFuture());
    }

    public function canAttend()
    {
        $event = $this->event;
        
        // Use start_time directly if it's already a datetime
        if ($event->start_time instanceof \Carbon\Carbon) {
            $eventDateTime = $event->start_time;
        } else {
            $eventDateTime = \Carbon\Carbon::parse($event->date . ' ' . $event->start_time);
        }
        
        return now()->isSameDay($eventDateTime) && now()->gte($eventDateTime);
    }

    public function markCertificateReceived()
    {
        if ($this->can_receive_certificate) {
            $this->has_received_certificate = true;
            $this->save();
            return true;
        }
        return false;
    }

    // Boot method to set default values
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($eventParticipant) {
            if (empty($eventParticipant->registration_number)) {
                $eventParticipant->registration_number = 'REG' . str_pad($eventParticipant->id ?? rand(1000, 9999), 4, '0', STR_PAD_LEFT);
            }
            if (empty($eventParticipant->attendance_token)) {
                // Generate unique 10-digit token
                do {
                    $token = str_pad(random_int(0, 9999999999), 10, '0', STR_PAD_LEFT);
                } while (self::where('attendance_token', $token)->exists());
                
                $eventParticipant->attendance_token = $token;
                $eventParticipant->token_generated_at = now();
                $eventParticipant->token_expires_at = now()->addDays(1);
                $eventParticipant->attendance_status = 'pending';
                $eventParticipant->verification_method = 'token';
            }
        });
    }
}
