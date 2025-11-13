<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'participant_id',
        'event_participant_id',
        'time_in',
        'time_out',
        'ip_address',
        'user_agent',
        'notes',
    ];

    protected $casts = [
        'time_in' => 'datetime',
        'time_out' => 'datetime',
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

    public function eventParticipant()
    {
        return $this->belongsTo(EventParticipant::class, 'event_participant_id');
    }
}
