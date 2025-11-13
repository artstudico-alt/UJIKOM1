<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

/**
 * @method void sendEmailVerificationNotification()
 * @method bool hasVerifiedEmail()
 * @method void markEmailAsVerified()
 * @method \Illuminate\Notifications\Notification routeNotificationForMail(\Illuminate\Notifications\Notification $notification = null)
 * @method string getEmailForVerification()
 */
class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'address',
        'education',
        'status',
        'role',
        'is_verified',
        'is_admin',
        'verification_code',
        'verification_code_expires_at'
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'verification_code',
        'verification_code_expires_at',
        'verification_attempts',
        'last_verification_attempt'
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'verification_code_expires_at' => 'datetime',
        'last_verification_attempt' => 'datetime',
        'is_admin' => 'boolean',
        'is_verified' => 'boolean',
        'verification_attempts' => 'integer',
    ];

    protected $attributes = [
        'status' => 'active',
        'verification_attempts' => 0,
        'is_verified' => false
    ];

    public function events()
    {
        return $this->belongsToMany(Event::class, 'participants')
            ->withPivot(['token', 'is_present', 'attended_at', 'certificate_path'])
            ->withTimestamps();
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function unreadNotifications()
    {
        return $this->hasMany(Notification::class)->where('is_read', false);
    }

    /**
     * Generate a verification code
     *
     * @return string
     */
    public function generateVerificationCode()
    {
        // Generate a 6-digit random number
        $this->verification_code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $this->verification_code_expires_at = now()->addMinutes(5); // 5 minutes expiration
        $this->verification_attempts = 0;
        $this->last_verification_attempt = now();
        $this->save();

        Log::info('Generated new verification code', [
            'user_id' => $this->id,
            'email' => $this->email,
            'code' => $this->verification_code,
            'expires_at' => $this->verification_code_expires_at
        ]);

        return $this->verification_code;
    }

    
    /**
     * Reset verification attempts
     * 
     * @return void
     */
    public function resetVerificationAttempts()
    {
        $this->verification_attempts = 0;
        $this->last_verification_attempt = null;
        $this->save();
    }
    
    /**
     * Mark the user's email as verified
     * 
     * @return bool
     */
    public function verifyEmail()
    {
        $this->is_verified = true;
        $this->email_verified_at = now();
        $this->verification_code = null;
        $this->verification_code_expires_at = null;
        $this->verification_attempts = 0;
        $this->last_verification_attempt = null;
        
        return $this->save();
    }
    
    /**
     * Determine if the user has verified their email address
     * 
     * @return bool
     */
    public function hasVerifiedEmail()
    {
        return $this->is_verified;
    }
    
    /**
     * Check if the user has reached the maximum verification attempts
     * 
     * @return bool
     */
    public function hasReachedMaxVerificationAttempts()
    {
        $maxAttempts = 3; // Maksimal 3 kali percobaan
        $lockoutMinutes = 5; // Kunci selama 5 menit
        
        if ($this->verification_attempts < $maxAttempts) {
            return false;
        }
        
        // Jika sudah melebihi waktu lockout, reset counter
        if ($this->last_verification_attempt && 
            $this->last_verification_attempt->addMinutes($lockoutMinutes)->isPast()) {
            $this->resetVerificationAttempts();
            return false;
        }
        
        return true;
    }
    
    /**
     * Increment the verification attempts
     * 
     * @return void
     */
    public function incrementVerificationAttempts()
    {
        $this->verification_attempts++;
        $this->last_verification_attempt = now();
        $this->save();
    }
    
    /**
     * Get the remaining time until the verification code expires
     * 
     * @return int|null
     */
    public function getVerificationCodeExpiresIn()
    {
        if (!$this->verification_code_expires_at) {
            return null;
        }
        
        return now()->diffInSeconds($this->verification_code_expires_at, false);
    }
}
