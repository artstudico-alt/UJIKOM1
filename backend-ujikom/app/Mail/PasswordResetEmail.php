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
        // Use named route to ensure URL matches web.php definition: /reset-password/{token}
        $this->resetUrl = route('password.reset', ['token' => $token, 'email' => $user->email]);
    }

    public function build()
    {
        return $this->subject('Reset Password')
                    ->markdown('emails.password-reset');
    }
}
