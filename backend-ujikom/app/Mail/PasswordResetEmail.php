<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordResetEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $resetUrl;

    public function __construct(User $user, $token)
    {
        $this->user = $user;
        // Generate frontend URL for password reset
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        $this->resetUrl = $frontendUrl . '/reset-password/' . $token . '?email=' . urlencode($user->email);
    }

    public function build()
    {
        return $this->subject('Reset Password')
                    ->markdown('emails.password-reset');
    }
}
