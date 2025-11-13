<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Token extends Model
{
    use HasFactory;

    protected $fillable = [
        'participant_id',
        'event_id',
        'token',
        'email',
        'is_used',
        'used_at',
        'expires_at'
    ];

    protected $casts = [
        'is_used' => 'boolean',
        'used_at' => 'datetime',
        'expires_at' => 'datetime'
    ];

    /**
     * Get the participant that owns the token.
     */
    public function participant()
    {
        return $this->belongsTo(Participant::class);
    }

    /**
     * Get the event that owns the token.
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Generate a random 10-digit token
     */
    public static function generateToken()
    {
        return str_pad(mt_rand(0, 9999999999), 10, '0', STR_PAD_LEFT);
    }

    /**
     * Check if token is valid and not expired
     */
    public function isValid()
    {
        return !$this->is_used && $this->expires_at > now();
    }
}
