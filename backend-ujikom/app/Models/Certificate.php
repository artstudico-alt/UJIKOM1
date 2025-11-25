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
        'generated_at',
        'downloaded_at',
    ];

    protected $casts = [
        'event_date' => 'date',
        'issued_at' => 'datetime',
        'verified_at' => 'datetime',
        'generated_at' => 'datetime',
        'downloaded_at' => 'datetime',
        'download_count' => 'integer',
        'file_size' => 'integer',
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

    /**
     * Scope untuk filter certificate berdasarkan user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('participant_id', $userId);
    }

    /**
     * Scope untuk filter certificate berdasarkan event
     */
    public function scopeForEvent($query, $eventId)
    {
        return $query->where('event_id', $eventId);
    }

    /**
     * Scope untuk filter certificate yang sudah di-generate
     */
    public function scopeGenerated($query)
    {
        return $query->where('status', 'generated');
    }

    /**
     * Check if certificate is ready to download
     */
    public function isReadyToDownload(): bool
    {
        return $this->status === 'generated' && !empty($this->file_path);
    }

    /**
     * Mark certificate as downloaded
     */
    public function markAsDownloaded()
    {
        $this->update([
            'status' => 'downloaded',
            'downloaded_at' => now(),
            'download_count' => $this->download_count + 1
        ]);
    }
}
