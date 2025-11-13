<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'participant_id',
        'event_participant_id',
        'certificate_number',
        'certificate_path',
        'participant_name',
        'event_title',
        'event_date',
        'file_path',
        'file_name',
        'file_size',
        'issued_at',
        'verified_at',
        'verification_notes',
        'download_count',
        'status',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'verified_at' => 'datetime',
        'download_count' => 'integer',
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
