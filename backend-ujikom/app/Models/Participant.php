<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Participant extends Model
{
    protected $table = 'participants';
    
    protected $fillable = [
        'user_id',
        'event_id',
        'token',
        'is_present',
        'attended_at',
        'certificate_path'
    ];

    protected $casts = [
        'is_present' => 'boolean',
        'attended_at' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function generateToken()
    {
        $this->token = str_pad(random_int(0, 9999999999), 10, '0', STR_PAD_LEFT);
        $this->save();
        return $this->token;
    }
}
